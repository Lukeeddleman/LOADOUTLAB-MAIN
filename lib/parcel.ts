// Parcel shape — shared by /api/shipping-rates, /api/create-checkout and the
// webhook's re-quote. Keeping one definition is what lets the server re-price
// shipping independently of whatever the browser claims.
//
// The dimensions themselves now live on each product (see lib/products.ts),
// because a box of cubes and a box of anything else are not the same parcel.

export interface Parcel {
  length: string;
  width: string;
  height: string;
  weight: string;
  distance_unit: string;
  mass_unit: string;
}
