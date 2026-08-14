/**
 * Name bridging between the GeoJSON state polygons (properties.STNAME_SH)
 * and the database state names.
 *
 * Verified against production: every STNAME_SH matches the database state name
 * exactly, EXCEPT the GeoJSON keeps 'Dadra & Nagar Haveli' and 'Daman & Diu'
 * as two polygons while the database has a single state 'DNH & DD'.
 */

const DNH_DD_GEO_NAMES = ['Dadra & Nagar Haveli', 'Daman & Diu'];
const DNH_DD_DATA_NAME = 'DNH & DD';

/** GeoJSON polygon name -> database state name */
export const geoToDataState = (geoName: string): string =>
  DNH_DD_GEO_NAMES.includes(geoName) ? DNH_DD_DATA_NAME : geoName;

/** Database state name -> the GeoJSON polygon name(s) that represent it */
export const dataToGeoStates = (dataName: string): string[] =>
  dataName === DNH_DD_DATA_NAME ? [...DNH_DD_GEO_NAMES] : [dataName];
