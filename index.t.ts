// index.d.ts
export interface BrandingVariantMeta {
  has_mono_file?: boolean;
  color_model?: "single" | "multi";
  colors?: string[];
}

export interface AirlineBranding {
  primary_color?: string;
  guidelines?: string;
  assets?: {
    icon?: BrandingVariantMeta;
    logo?: BrandingVariantMeta;
    tail?: BrandingVariantMeta;
  };
}

export interface AirlineMeta {
  name: string;
  iata?: string;
  icao?: string;
  country?: string;
  flag_carrier?: boolean;
  website?: string;
  alliance?: string;
  branding?: AirlineBranding;
  subsidiaries?: Array<{
    name: string;
    iata?: string;
    icao?: string;
    country?: string;
    flag_carrier?: boolean;
  }>;
  slug?: string;
}

export type AssetPaths = {
  color: string;
  monochrome: string | null;
};

export type ResolvedAssets = {
  icon?: AssetPaths;
  logo?: AssetPaths;
  tail?: AssetPaths;
};

export function listAirlines(): AirlineMeta[];
export function getAirline(key: string): AirlineMeta | null;
export function getAssets(key: string): ResolvedAssets | null;

declare const _default: {
  listAirlines: typeof listAirlines;
  getAirline: typeof getAirline;
  getAssets: typeof getAssets;
};
export default _default;
