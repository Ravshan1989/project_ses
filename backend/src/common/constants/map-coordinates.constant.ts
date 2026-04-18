export const MAP_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Tashkent region examples
  "toshkent viloyati": { lat: 41.200, lng: 69.400 },
  "nurafshon sh": { lat: 41.040, lng: 69.350 },
  "angren sh": { lat: 41.010, lng: 70.070 },
  "bekobod sh": { lat: 40.210, lng: 69.220 },
  "chirchiq sh": { lat: 41.470, lng: 69.580 },
  "olmaliq sh": { lat: 40.850, lng: 69.590 },
  "ohangaron sh": { lat: 40.910, lng: 69.640 },
  "yangiyo'l sh": { lat: 41.110, lng: 69.050 },
  "bo'stonliq t": { lat: 41.560, lng: 70.020 },
  "zangiota t": { lat: 41.200, lng: 69.170 },
  "qibray t": { lat: 41.380, lng: 69.460 },
  "parkent t": { lat: 41.320, lng: 69.680 },
  // Qashqadaryo region examples
  "qashqadaryo viloyati": { lat: 38.890, lng: 65.800 },
  "qarshi sh": { lat: 38.840, lng: 65.790 },
  "shahrisabz sh": { lat: 39.050, lng: 66.830 },
  "nishon t": { lat: 38.560, lng: 65.680 },
  // Andijon region examples
  "andijon viloyati": { lat: 40.750, lng: 72.360 },
  "andijon sh": { lat: 40.780, lng: 72.340 },
  "asaka t": { lat: 40.630, lng: 72.230 },
  "olinko'l t": { lat: 40.810, lng: 72.160 },
};

// Fallback coordinate if the organization name is not found (Center of Uzbekistan roughly)
export const DEFAULT_MAP_COORD = { lat: 41.311, lng: 69.240 };
