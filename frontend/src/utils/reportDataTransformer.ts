export interface Organization {
    id: string;
    name: string;
    parent?: {
        id: string;
        name: string;
    };
}

export const transformToHierarchy = (
    apiData: any[],
    organizations: Organization[],
    defaultFields: any,
    isAdmin: boolean,
    userOrgId: string | null
) => {
    // 1. Filter organizations if not admin
    let filteredOrgs = organizations;
    if (!isAdmin && userOrgId) {
        // If user is district level, they see only their district
        // If user is regional level, they see their region and its districts
        // This logic should be handled by the backend ideally, but we safeguard here.
        filteredOrgs = organizations.filter(o => 
            o.id === userOrgId || (o.parent && o.parent.id === userOrgId)
        );
    }

    // 2. Identify Parents (Viloyats)
    const regions = organizations.filter(o => !o.parent);
    const districts = organizations.filter(o => !!o.parent);

    // 3. Map API data to Districts
    const districtResults = districts.map((org) => {
        const existing = apiData.find((r: any) => r.organization?.id === org.id);
        return {
            ...defaultFields,
            ...(existing || {}),
            key: org.id, // Use ID as key for tree structure
            district_name: org.name,
            organizationId: org.id,
            parentId: org.parent?.id,
            is_submitted: !!existing,
            isParent: false
        };
    });

    // 4. Group Districts by Parent and Calculate Parent Sums
    const hierarchy = regions.map((region) => {
        const children = districtResults.filter(d => d.parentId === region.id);
        
        // Only include region if it has children or if it's the user's focus
        if (children.length === 0 && (!isAdmin && region.id !== userOrgId)) return null;

        // Sum up all numerical fields for the parent row
        const parentData: any = {
            ...defaultFields,
            key: region.id,
            district_name: region.name,
            organizationId: region.id,
            is_submitted: children.every(c => c.is_submitted) && children.length > 0,
            isParent: true,
            children: children
        };

        // For each key in defaultFields, if it's a number, sum it up
        Object.keys(defaultFields).forEach(field => {
            if (typeof defaultFields[field] === 'number') {
                parentData[field] = children.reduce((sum, child) => sum + (Number(child[field]) || 0), 0);
            }
        });

        // Specialized fields like 'status'
        if (children.length > 0) {
            const statuses = children.map(c => c.status).filter(Boolean);
            if (statuses.every(s => s === 'APPROVED')) parentData.status = 'APPROVED';
            else if (statuses.some(s => s === 'REJECTED')) parentData.status = 'REJECTED';
            else if (statuses.every(s => s === 'VERIFIED' || s === 'APPROVED')) parentData.status = 'VERIFIED';
            else if (statuses.some(s => s === 'SUBMITTED' || s === 'VERIFIED')) parentData.status = 'SUBMITTED';
            else parentData.status = 'DRAFT';
        }

        return parentData;
    }).filter(Boolean);

    // 5. Special case: If some districts have NO parent in the list (should not happen with good data)
    // but if they do, we could add them as top-level. For now, we follow hierarchy.

    return hierarchy;
};
