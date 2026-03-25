import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../roles/entities/role.entity";
import { RolePermission } from "../roles/entities/role-permission.entity";
import { UserRole } from "../../common/enums/role.enum";
import { Organization } from "../organizations/entities/organization.entity";
import { Department } from "../departments/entities/department.entity";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { Permission } from "../permissions/entities/permission.entity";
import { DepartmentPermission } from "../permissions/entities/department-permission.entity";

@Injectable()
export class SeedingService implements OnModuleInit {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(DepartmentPermission)
    private readonly deptPermRepo: Repository<DepartmentPermission>,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    this.logger.log("Checking and seeding initial data...");
    await this.seedDistricts();
    await this.seedPermissions();
    await this.seedDepartmentPermissions();
    await this.seedAdmin(); // UZ: Faqat admin hisobini tekshirish
    this.logger.log("Seeding check complete.");
  }

  private async seedHR() {
    const hrUsername = "kadr_chirchiq";
    const existingHR = await this.usersService.findOneByUsername(hrUsername);

    if (existingHR) return;

    const chirchiq = await this.orgRepo.findOne({
      where: { name: "Chirchiq sh" },
    });
    if (!chirchiq) return;

    let dept = await this.deptRepo.findOne({
      where: { name: "Boshqaruv (Admin)" },
    });
    if (!dept) {
      dept = await this.deptRepo.save(
        this.deptRepo.create({
          name: "Boshqaruv (Admin)",
          level: 1,
          isActive: true,
        }),
      );
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash("ses12345", salt);

    await this.usersService.create({
      username: hrUsername,
      passwordHash,
      role: UserRole.HR,
      organizationId: chirchiq.id,
      departmentId: dept.id,
      isActive: true,
      firstName: "Chirchiq",
      lastName: "Kadri",
    });

    this.logger.log(`HR user created: ${hrUsername} / ses12345`);
  }

  private async seedAdmin() {
    const adminUsername = "admin";
    const existingAdmin =
      await this.usersService.findOneByUsername(adminUsername);

    if (existingAdmin) {
      this.logger.log("Admin user already exists.");
      return;
    }

    // Get/Create Department
    let dept = await this.deptRepo.findOne({
      where: { name: "Boshqaruv (Admin)" },
    });
    if (!dept) {
      dept = await this.deptRepo.save(
        this.deptRepo.create({
          name: "Boshqaruv (Admin)",
          description: "Sistem Administrator",
          level: 1,
          isActive: true,
        }),
      );
    }

    // Get/Create Viloyat Organization
    let viloyat = await this.orgRepo.findOne({
      where: { name: "Toshkent viloyati" },
    });
    if (!viloyat) {
      viloyat = await this.orgRepo.save(
        this.orgRepo.create({
          name: "Toshkent viloyati",
          population: 3000000,
        }),
      );
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash("admin1234", salt);

    await this.usersService.create({
      username: adminUsername,
      passwordHash,
      role: UserRole.ADMIN,
      organizationId: viloyat.id,
      departmentId: dept.id,
      isActive: true,
      firstName: "System",
      lastName: "Administrator",
    });

    this.logger.log(`Admin user created: ${adminUsername} / admin1234`);
  }

  private async seedDistricts() {
    const REGIONS = [
      "Toshkent viloyati",
      "Toshkent shahri",
      "Andijon viloyati",
      "Buxoro viloyati",
      "Farg'ona viloyati",
      "Jizzax viloyati",
      "Namangan viloyati",
      "Navoiy viloyati",
      "Qashqadaryo viloyati",
      "Qoraqalpog'iston Respublikasi",
      "Samarqand viloyati",
      "Sirdaryo viloyati",
      "Surxondaryo viloyati",
      "Xorazm viloyati",
    ];

    for (const regionName of REGIONS) {
      let region = await this.orgRepo.findOne({
        where: { name: regionName },
      });
      if (!region) {
        this.logger.log(`Creating region: ${regionName}...`);
        await this.orgRepo.save(
          this.orgRepo.create({
            name: regionName,
            population: 2000000, // Default population if unknown
          }),
        );
      }
    }

    const tashkentRegion = await this.orgRepo.findOne({
      where: { name: "Toshkent viloyati" },
    });

    const REGION_DISTRICTS: Record<string, string[]> = {
      "Toshkent shahri": [
        "Olmazor t", "Bektemir t", "Mirobod t", "Mirzo Ulug'bek t", "Sergeli t", "Shayxontohur t",
        "Uchtepa t", "Chilonzor t", "Yunusobod t", "Yakkasaroy t", "Yashnobod t", "Yangihayot t"
      ],
      "Andijon viloyati": [
        "Andijon t", "Asaka t", "Baliqchi t", "Boʻston t", "Buloqboshi t", "Izboskan t",
        "Jalaquduq t", "Kurgantepa t", "Marhamat t", "Oltinkoʻl t", "Paxtaobod t", "Shahrixon t",
        "Ulugʻnor t", "Xoʻjaobod t"
      ],
      "Buxoro viloyati": [
        "Buxoro t", "Gʻijduvon t", "Jondor t", "Kogon t", "Qorakoʻl t", "Qorovulbozor t",
        "Olot t", "Peshku t", "Romitan t", "Shofirkon t", "Vobkent t"
      ],
      "Farg'ona viloyati": [
        "Oltiariq t", "Bagʻdod t", "Beshariq t", "Buvayda t", "Dangʻara t", "Fergana t",
        "Furqat t", "Qoʻshtepa t", "Quva t", "Rishton t", "Soʻx t", "Toshloq t",
        "Uchkoʻprik t", "Yozyovon t", "Oʻzbekiston t"
      ],
      "Jizzax viloyati": [
        "Arnasoy t", "Baxmal t", "G'allaorol t", "Jizzax t", "Doʻstlik t", "Zomin t",
        "Zarbdor t", "Zafarobod t", "Mirzachoʻl t", "Paxtakor t", "Forish t", "Yangiobod t"
      ],
      "Qashqadaryo viloyati": [
        "Chiroqchi t", "Dehqonobod t", "Gʻuzor t", "Qamashi t", "Qarshi t", "Koson t",
        "Kasbi t", "Kitob t", "Mirishkor t", "Muborak t", "Nishon t", "Shahrisabz t",
        "Yakkabogʻ t", "Ko'kdala t"
      ],
      "Namangan viloyati": [
        "Chortoq t", "Chust t", "Kosonsoy t", "Mingbuloq t", "Namangan t", "Norin t",
        "Pop t", "Toʻraqoʻrgʻon t", "Uchqoʻrgʻon t", "Uychi t", "Yangiqoʻrgʻon t"
      ],
      "Navoiy viloyati": [
        "Konimex t", "Qiziltepa t", "Xatirchi t", "Navbahor t", "Karmana t", "Nurota t",
        "Tomdi t", "Uchquduq t"
      ],
      "Qoraqalpog'iston Respublikasi": [
        "Amudaryo t", "Beruniy t", "Chimboy t", "Ellikqala t", "Kegeyli t", "Moʻynoq t",
        "Nukus t", "Qanlikoʻl t", "Qoʻngʻirot t", "Qoraoʻzak t", "Shumanay t",
        "Taxtakoʻpir t", "Toʻrtkoʻl t", "Xoʻjayli t", "Taxiatosh t", "Boʻzatov t"
      ],
      "Samarqand viloyati": [
        "Bulungʻur t", "Jomboy t", "Ishtixon t", "Kattaqo'rg'on t", "Oqdaryo t", "Paxtachi t",
        "Pastdargʻom t", "Narpay t", "Nurabod t", "Samarkand t", "Toyloq t", "Urgut t", "Qoʻshrabot t"
      ],
      "Sirdaryo viloyati": [
        "Boyovut t", "Guliston t", "Mirzaobod t", "Oqoltin t", "Saixunobod t", "Sardoba t",
        "Sirdaryo t", "Xovos t"
      ],
      "Surxondaryo viloyati": [
        "Angor t", "Bandixon t", "Boysun t", "Denov t", "Jarqoʻrgʻon t", "Qiziriq t",
        "Qumqoʻrgʻon t", "Muzrabot t", "Oltinsoy t", "Sariosiyo t", "Sherobod t",
        "Shoʻrchi t", "Termiz t", "Uzun t"
      ],
      "Xorazm viloyati": [
        "Bogʻot t", "Gurlan t", "Xonqa t", "Hazorasp t", "Khiva t", "Qoʻshkoʻpir t",
        "Shovot t", "Urganch t", "Yangiariq t", "Yangibozor t", "Tuproqqalʼa t"
      ],
    };

    for (const [regionName, districts] of Object.entries(REGION_DISTRICTS)) {
      const region = await this.orgRepo.findOne({ where: { name: regionName } });
      if (!region) continue;

      for (const name of districts) {
        let district = await this.orgRepo.findOne({ where: { name } });
        if (!district) {
          await this.orgRepo.save(
            this.orgRepo.create({
              name,
              parent: region,
              population: 150000,
            }),
          );
          this.logger.log(`Created district: ${name} in ${regionName}`);
        }
      }
    }
  }

  private async seedDepartmentPermissions() {
    const permissionsData = [
      { code: "VIEW_HEPATITIS", description: "View Hepatitis Reports" },
      { code: "VIEW_FLU", description: "View Flu/ARI Reports" },
      { code: "VIEW_EPIDEMIOLOGY", description: "View Epidemiology Reports" },
      { code: "VIEW_WEEKLY_SUMMARY", description: "View Weekly Summaries" },
      { code: "VIEW_COVID", description: "View Covid-19 Reports" },
      { code: "VIEW_ARI", description: "View ARI Reports" },
      { code: "VIEW_DIARRHEA", description: "View Diarrhea Reports" },
      {
        code: "VIEW_SANITARY",
        description: "View Sanitary Reports (Tekshirishlar)",
      },
      { code: "VIEW_FORM1_TABLE1", description: "View/Edit Form 1 Table 1" },
      { code: "VIEW_FORM1_TABLE2", description: "View Form 1 Table 2" },
      { code: "VIEW_FORM1_TABLE3", description: "View Form 1 Table 3" },
      { code: "EDIT_FORM1_TABLE1", description: "Edit Form 1 Table 1" },
      { code: "VERIFY_REPORT", description: "Verify Report (Mudir)" },
      { code: "APPROVE_REPORT", description: "Approve Report (Rahbar)" },
      {
        code: "VIEW_APPEALS",
        description: "View Appeals and Execution Discipline",
      },
      {
        code: "EDIT_APPEALS",
        description: "Edit Appeals and Execution Discipline",
      },
      {
        code: "VIEW_NUTRITION_HYGIENE",
        description: "View Nutrition Hygiene Reports",
      },
      {
        code: "EDIT_NUTRITION_HYGIENE",
        description: "Edit Nutrition Hygiene Reports",
      },
      {
        code: "MANAGE_DEPARTMENTS",
        description: "Create/Edit Departments and Permissions",
      },
      {
        code: "VIEW_WATER_HYGIENE",
        description: "View Water and Communal Hygiene Reports",
      },
      {
        code: "VIEW_CHILDREN_HYGIENE",
        description: "View Children and Adolescent Hygiene Reports",
      },
    ];

    for (const p of permissionsData) {
      let perm = await this.permRepo.findOneBy({ code: p.code });
      if (!perm) {
        perm = this.permRepo.create(p);
        await this.permRepo.save(perm);
        this.logger.log(`Created Permission: ${perm.code}`);
      }
    }

    const departmentsData = [
      {
        name: "Epidemiologiya Bo'limi",
        description: "Faqat epidemiologiya va haftalik xulosani ko'radi",
        level: 1,
      },
      {
        name: "Boshqaruv (Admin)",
        description: "Hamma narsani ko'radi",
        level: 1,
      },
      {
        name: "Sanitariya Bo'limi",
        description: "Faqat sanitariya tadbirlarini ko'radi",
        level: 1,
      },
      {
        name: "Epidemiologiya va immunoprofilaktika",
        description: "Tuman darajasi: Faqat Forma 1-jadval va kunliklar",
        level: 3,
      },
      {
        name: "Sanitariya",
        description: "Tuman darajasi: Sanitariya va gigiyena tadbirlari",
        level: 3,
      },
      {
        name: "Ijro intizomi va murojaatlar bilan ishlash bo'limi",
        description: "Ijro intizomi va murojaatlar bilan ishlash",
        level: 1,
      },
      {
        name: "Ovqatlanish gigiyenasi bo'limi",
        description: "Ovqatlanish gigiyenasi bo'limi mutaxassislari",
        level: 1,
      },
      {
        name: "Kommunal gigiyena bo'limi",
        description: "Kommunal gigiyena bo'limi (Viloyat darajasi)",
        level: 1,
      },
      {
        name: "Kommunal gigiyena",
        description: "Kommunal gigiyena (Tuman darajasi)",
        level: 3,
      },
    ];

    for (const d of departmentsData) {
      let dept = await this.deptRepo.findOneBy({ name: d.name });
      if (!dept) {
        dept = this.deptRepo.create(d);
        await this.deptRepo.save(dept);
        this.logger.log(`Created Department: ${dept.name}`);
      }
    }

    const level1Assignments = [
      {
        dept: "Epidemiologiya Bo'limi",
        perms: ["VIEW_EPIDEMIOLOGY", "VIEW_WEEKLY_SUMMARY"],
      },
      {
        dept: "Sanitariya Bo'limi",
        perms: ["VIEW_SANITARY"],
      },
      {
        dept: "Boshqaruv (Admin)",
        perms: [
          "VIEW_HEPATITIS",
          "VIEW_FLU",
          "VIEW_EPIDEMIOLOGY",
          "VIEW_WEEKLY_SUMMARY",
          "VIEW_COVID",
          "VIEW_ARI",
          "VIEW_DIARRHEA",
          "VIEW_SANITARY",
          "VIEW_APPEALS",
          "EDIT_APPEALS",
          "VIEW_NUTRITION_HYGIENE",
          "EDIT_NUTRITION_HYGIENE",
          "VIEW_FORM1_TABLE1",
          "VIEW_FORM1_TABLE2",
          "VIEW_FORM1_TABLE3",
          "EDIT_FORM1_TABLE1",
          "VERIFY_REPORT",
          "APPROVE_REPORT",
          "MANAGE_DEPARTMENTS",
        ],
      },
      {
        dept: "Ijro intizomi va murojaatlar bilan ishlash bo'limi",
        perms: ["VIEW_APPEALS", "EDIT_APPEALS"],
      },
      {
        dept: "Ovqatlanish gigiyenasi bo'limi",
        perms: ["VIEW_NUTRITION_HYGIENE", "EDIT_NUTRITION_HYGIENE"],
      },
      {
        dept: "Kommunal gigiyena bo'limi",
        perms: ["VIEW_WATER_HYGIENE", "VIEW_SANITARY"],
      },
    ];

    for (const assign of level1Assignments) {
      const dept = await this.deptRepo.findOneBy({ name: assign.dept });
      if (!dept) continue;
      for (const code of assign.perms) {
        await this.assignPermissionToDept(dept, code);
      }
    }

    const level3Depts = await this.deptRepo.findBy({ level: 3 });
    const level3Perms = [
      "VIEW_FORM1_TABLE1",
      "EDIT_FORM1_TABLE1",
      "VIEW_HEPATITIS",
      "VIEW_FLU",
      "VIEW_EPIDEMIOLOGY",
      "VIEW_WEEKLY_SUMMARY",
      "VIEW_COVID",
      "VIEW_ARI",
      "VIEW_DIARRHEA",
      "VIEW_SANITARY",
      "VIEW_WATER_HYGIENE",
      "VIEW_CHILDREN_HYGIENE",
    ];

    for (const dept of level3Depts) {
      for (const code of level3Perms) {
        await this.assignPermissionToDept(dept, code);
      }
    }
  }

  private async assignPermissionToDept(dept: Department, code: string) {
    const perm = await this.permRepo.findOneBy({ code });
    if (!perm) return;
    const exists = await this.deptPermRepo.findOne({
      where: { department: { id: dept.id }, permission: { id: perm.id } },
    });
    if (!exists) {
      await this.deptPermRepo.save(
        this.deptPermRepo.create({ department: dept, permission: perm }),
      );
    }
  }

  private async seedPermissions() {
    const rolesToSeed = [
      {
        name: UserRole.DISTRICT_SPECIALIST,
        level: 3,
        description: "Tuman Mutaxassisi (Vrach)",
      },
      {
        name: UserRole.DISTRICT_OPERATOR,
        level: 3,
        description: "Tuman Operatori (Yordamchi)",
      },
      {
        name: UserRole.DEPARTMENT_HEAD,
        level: 3,
        description: "Bo'lim Mudiri",
      },
      { name: UserRole.DISTRICT_HEAD, level: 3, description: "Tuman Rahbari" },
      {
        name: UserRole.SANITARY_HEAD,
        level: 3,
        description: "Sanitariya Bo'limi Mudiri",
      },
      {
        name: UserRole.SANITARY_SPECIALIST,
        level: 3,
        description: "Sanitar Vrach",
      },
      {
        name: UserRole.SANITARY_OPERATOR,
        level: 3,
        description: "Sanitar Yordamchisi",
      },
      {
        name: UserRole.LEAD_SPECIALIST,
        level: 2, // Viloyat
        description: "Viloyat Yetakchi Mutaxassisi",
      },
      {
        name: UserRole.LEAD_SPECIALIST,
        level: 3, // Tuman
        description: "Tuman Yetakchi Mutaxassisi",
      },
      {
        name: UserRole.REGION_HEAD,
        level: 2,
        description: "Viloyat Boshqarmasi Rahbari",
      },
      {
        name: UserRole.REPUBLIC_HEAD,
        level: 1,
        description: "Respublika Boshqarmasi Rahbari",
      },
    ];

    for (const r of rolesToSeed) {
      const exists = await this.roleRepo.findOneBy({ name: r.name });
      if (!exists) {
        await this.roleRepo.save(this.roleRepo.create(r));
      }
    }

    const assignments = [
      {
        role: UserRole.DISTRICT_OPERATOR,
        perms: [
          "VIEW_EPIDEMIOLOGY",
          "VIEW_HEPATITIS",
          "VIEW_FLU",
          "VIEW_ARI",
          "VIEW_COVID",
          "VIEW_DIARRHEA",
        ],
        canCreate: true,
        canEdit: false,
        canApprove: false,
        canDownload: true,
      },
      {
        role: UserRole.DISTRICT_SPECIALIST,
        perms: [
          "VIEW_EPIDEMIOLOGY",
          "VIEW_HEPATITIS",
          "VIEW_FLU",
          "VIEW_ARI",
          "VIEW_COVID",
          "VIEW_DIARRHEA",
        ],
        canCreate: true,
        canEdit: true,
        canApprove: false,
        canDownload: true,
      },
      {
        role: UserRole.DEPARTMENT_HEAD,
        perms: [
          "VIEW_EPIDEMIOLOGY",
          "VIEW_HEPATITIS",
          "VIEW_FLU",
          "VIEW_ARI",
          "VIEW_COVID",
          "VIEW_DIARRHEA",
          "VERIFY_REPORT",
        ],
        canCreate: false,
        canEdit: false,
        canApprove: true,
        canDownload: true,
      },
      {
        role: UserRole.DISTRICT_HEAD,
        perms: [
          "VIEW_EPIDEMIOLOGY",
          "VIEW_HEPATITIS",
          "VIEW_FLU",
          "VIEW_ARI",
          "VIEW_COVID",
          "VIEW_DIARRHEA",
          "APPROVE_REPORT",
        ],
        canCreate: false,
        canEdit: false,
        canApprove: true,
        canDownload: true,
      },
      {
        role: UserRole.SANITARY_OPERATOR,
        perms: ["VIEW_SANITARY"],
        canCreate: true,
        canEdit: false,
        canApprove: false,
        canDownload: true,
      },
      {
        role: UserRole.SANITARY_SPECIALIST,
        perms: ["VIEW_SANITARY"],
        canCreate: true,
        canEdit: true,
        canApprove: false,
        canDownload: true,
      },
      {
        role: UserRole.SANITARY_HEAD,
        perms: ["VIEW_SANITARY", "VERIFY_REPORT"],
        canCreate: false,
        canEdit: false,
        canApprove: true,
        canDownload: true,
      },
      {
        role: UserRole.LEAD_SPECIALIST,
        perms: ["VIEW_APPEALS", "EDIT_APPEALS"],
        canCreate: true,
        canEdit: true,
        canApprove: false,
        canDownload: true,
      },
      {
        role: UserRole.REGION_HEAD,
        perms: [
          "VIEW_EPIDEMIOLOGY",
          "VIEW_HEPATITIS",
          "VIEW_FLU",
          "VIEW_ARI",
          "VIEW_COVID",
          "VIEW_DIARRHEA",
          "APPROVE_REPORT",
          "VIEW_APPEALS",
          "EDIT_APPEALS",
          "VIEW_NUTRITION_HYGIENE",
        ],
        canCreate: true,
        canEdit: true,
        canApprove: true,
        canDownload: true,
      },
      {
        role: UserRole.REPUBLIC_HEAD,
        perms: [
          "VIEW_EPIDEMIOLOGY",
          "VIEW_HEPATITIS",
          "VIEW_FLU",
          "VIEW_ARI",
          "VIEW_COVID",
          "VIEW_DIARRHEA",
          "APPROVE_REPORT",
          "VIEW_APPEALS",
          "EDIT_APPEALS",
          "VIEW_NUTRITION_HYGIENE",
          "MANAGE_DEPARTMENTS",
        ],
        canCreate: true,
        canEdit: true,
        canApprove: true,
        canDownload: true,
      },
    ];

    for (const assign of assignments) {
      const role = await this.roleRepo.findOneBy({ name: assign.role });
      if (!role) continue;
      await this.rolePermRepo.delete({ role: { id: role.id } });
      for (const code of assign.perms) {
        await this.rolePermRepo.save(
          this.rolePermRepo.create({
            role: role,
            permissionCode: code,
            canView: true,
            canCreate: assign.canCreate,
            canEdit: assign.canEdit,
            canApprove: assign.canApprove,
            canDownload: assign.canDownload,
          }),
        );
      }
    }
  }

  private async seedTestTrio() {
    const chirchiq = await this.orgRepo.findOne({
      where: { name: "Chirchiq sh" },
    });
    if (!chirchiq) return;
    const dept = await this.deptRepo.findOne({
      where: { name: "Boshqaruv (Admin)" },
    });
    if (!dept) return;

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash("ses12345", salt);
    const users = [
      {
        username: "operator_chirchiq",
        role: UserRole.DISTRICT_OPERATOR,
        name: "Operator Chirchiq",
      },
      {
        username: "mudir_chirchiq",
        role: UserRole.DEPARTMENT_HEAD,
        name: "Mudir Chirchiq",
      },
      {
        username: "rahbar_chirchiq",
        role: UserRole.DISTRICT_HEAD,
        name: "Rahbar Chirchiq",
      },
    ];

    for (const u of users) {
      const exists = await this.usersService.findOneByUsername(u.username);
      const roleEntity = await this.roleRepo.findOne({
        where: { name: u.role },
      });
      if (!exists) {
        await this.usersService.create({
          username: u.username,
          passwordHash: hash,
          role: u.role,
          dynamicRoleId: roleEntity?.id,
          organizationId: chirchiq.id,
          departmentId: dept.id,
          firstName: u.name,
          lastName: "Test",
        });
      } else if (!exists.dynamicRole && roleEntity) {
        await this.usersService.update(exists.id, {
          dynamicRoleId: roleEntity.id,
        });
      }
    }
  }
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * SeedingService was heavily modified to include Sanitary department, roles, and permissions.
 * Original logic for seedDistricts and initial test users was preserved.
 */
