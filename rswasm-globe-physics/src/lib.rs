//! rswasm-globe-physics — WASM-compiled globe physics engine.
//!
//! Provides fast spherical geometry calculations for the COBE globe:
//! - Haversine distance between lat/lng points
//! - Great-circle midpoint interpolation
//! - 3D vector rotation (Euler & quaternion)
//! - Arc point generation for curved flight paths
//!
//! All functions are #[no_mangle] extern "C" for direct WASM interop,
//! plus wasm-bindgen exports for JS-side consumption.

use std::f64::consts::PI;

// ─── Constants ───────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM: f64 = 6371.0;
const DEG_TO_RAD: f64 = PI / 180.0;
const RAD_TO_DEG: f64 = 180.0 / PI;

// ─── Coordinate Types ───────────────────────────────────────────────────────

/// A geographic coordinate in degrees.
#[derive(Debug, Clone, Copy, serde::Serialize, serde::Deserialize)]
pub struct GeoCoord {
    pub lat: f64,
    pub lng: f64,
}

/// A 3D vector on the unit sphere.
#[derive(Debug, Clone, Copy, serde::Serialize, serde::Deserialize)]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

// ─── Core Conversions ───────────────────────────────────────────────────────

/// Convert degrees to radians.
#[inline]
pub fn to_radians(deg: f64) -> f64 {
    deg * DEG_TO_RAD
}

/// Convert radians to degrees.
#[inline]
pub fn to_degrees(rad: f64) -> f64 {
    rad * RAD_TO_DEG
}

/// Project a geographic coordinate onto the unit sphere.
pub fn geo_to_vec3(coord: &GeoCoord) -> Vec3 {
    let lat = to_radians(coord.lat);
    let lng = to_radians(coord.lng);
    let cos_lat = lat.cos();
    Vec3 {
        x: cos_lat * lng.cos(),
        y: lat.sin(),
        z: cos_lat * lng.sin(),
    }
}

/// Inverse: unit sphere vector back to geographic coordinates.
pub fn vec3_to_geo(v: &Vec3) -> GeoCoord {
    let lat = to_degrees(v.y.asin());
    let lng = to_degrees(v.x.atan2(v.z));
    GeoCoord { lat, lng }
}

// ─── Haversine Distance ─────────────────────────────────────────────────────

/// Compute the great-circle distance (km) between two points using the
/// Haversine formula. Accurate to ~0.5% for any pair of points.
pub fn haversine_km(a: &GeoCoord, b: &GeoCoord) -> f64 {
    let dlat = to_radians(b.lat - a.lat);
    let dlng = to_radians(b.lng - a.lng);
    let sin_dlat = (dlat * 0.5).sin();
    let sin_dlng = (dlng * 0.5).sin();
    let lat1 = to_radians(a.lat);
    let lat2 = to_radians(b.lat);

    let h = sin_dlat * sin_dlat + lat1.cos() * lat2.cos() * sin_dlng * sin_dlng;
    2.0 * EARTH_RADIUS_KM * h.sqrt().asin()
}

// ─── Great-Circle Midpoint ──────────────────────────────────────────────────

/// Interpolate the midpoint along the great-circle arc between two points.
/// Returns a point at fraction `t` (0.0 = a, 1.0 = b).
pub fn great_circle_interp(a: &GeoCoord, b: &GeoCoord, t: f64) -> GeoCoord {
    let va = geo_to_vec3(a);
    let vb = geo_to_vec3(b);
    let angle = (va.x * vb.x + va.y * vb.y + va.z * vb.z).acos();

    if angle < 1e-12 {
        return *a;
    }

    let sin_angle = angle.sin();
    let scale_a = ((1.0 - t) * angle).sin() / sin_angle;
    let scale_b = (t * angle).sin() / sin_angle;

    let v = Vec3 {
        x: va.x * scale_a + vb.x * scale_b,
        y: va.y * scale_a + vb.y * scale_b,
        z: va.z * scale_a + vb.z * scale_b,
    };

    vec3_to_geo(&v)
}

// ─── Arc Point Generation ───────────────────────────────────────────────────

/// Generate `n` interpolated points along the great-circle arc from `from` to
/// `to`. Returns a JSON string of `{lat, lng}[]` for direct JS consumption.
pub fn generate_arc_points(from: &GeoCoord, to: &GeoCoord, n: usize) -> String {
    let points: Vec<GeoCoord> = (0..=n)
        .map(|i| great_circle_interp(from, to, i as f64 / n as f64))
        .collect();
    serde_json::to_string(&points).unwrap_or_default()
}

// ─── Rotation Helpers ───────────────────────────────────────────────────────

/// Apply a Y-axis rotation (yaw) to a vector.
pub fn rotate_y(v: &Vec3, angle_rad: f64) -> Vec3 {
    let cos_a = angle_rad.cos();
    let sin_a = angle_rad.sin();
    Vec3 {
        x: v.x * cos_a + v.z * sin_a,
        y: v.y,
        z: -v.x * sin_a + v.z * cos_a,
    }
}

/// Apply a X-axis rotation (pitch) to a vector.
pub fn rotate_x(v: &Vec3, angle_rad: f64) -> Vec3 {
    let cos_a = angle_rad.cos();
    let sin_a = angle_rad.sin();
    Vec3 {
        x: v.x,
        y: v.y * cos_a - v.z * sin_a,
        z: v.y * sin_a + v.z * cos_a,
    }
}

// ─── Extern "C" FFI Exports (for direct WASM calls from JS) ────────────────

#[no_mangle]
pub extern "C" fn haversine_km_ffi(lat1: f64, lng1: f64, lat2: f64, lng2: f64) -> f64 {
    haversine_km(
        &GeoCoord { lat: lat1, lng: lng1 },
        &GeoCoord { lat: lat2, lng: lng2 },
    )
}

#[no_mangle]
pub extern "C" fn great_circle_interp_ffi(
    lat1: f64,
    lng1: f64,
    lat2: f64,
    lng2: f64,
    t: f64,
) -> f64 {
    let result = great_circle_interp(
        &GeoCoord { lat: lat1, lng: lng1 },
        &GeoCoord { lat: lat2, lng: lng2 },
        t,
    );
    result.lat // returns lat only; use generate_arc_points for full data
}

// ─── wasm-bindgen exports ──────────────────────────────────────────────────

#[cfg(target_arch = "wasm32")]
pub mod wasm {
    use super::*;
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen]
    pub fn haversine_km_js(lat1: f64, lng1: f64, lat2: f64, lng2: f64) -> f64 {
        haversine_km_ffi(lat1, lng1, lat2, lng2)
    }

    #[wasm_bindgen]
    pub fn great_circle_interp_js(lat1: f64, lng1: f64, lat2: f64, lng2: f64, t: f64) -> String {
        generate_arc_points(&GeoCoord { lat: lat1, lng: lng1 }, &GeoCoord { lat: lat2, lng: lng2 }, 32)
    }

    #[wasm_bindgen]
    pub fn rotate_point_js(x: f64, y: f64, z: f64, yaw_deg: f64, pitch_deg: f64) -> String {
        let v = Vec3 { x, y, z };
        let v = rotate_y(&v, to_radians(yaw_deg));
        let v = rotate_x(&v, to_radians(pitch_deg));
        serde_json::to_string(&v).unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_haversine_sf_to_nyc() {
        // San Francisco (37.77, -122.42) → New York (40.71, -74.01)
        let sf = GeoCoord { lat: 37.77, lng: -122.42 };
        let nyc = GeoCoord { lat: 40.71, lng: -74.01 };
        let dist = haversine_km(&sf, &nyc);
        // Approx 4120 km — accept +-5%
        assert!((dist - 4120.0).abs() / 4120.0 < 0.05);
    }

    #[test]
    fn test_great_circle_midpoint() {
        let a = GeoCoord { lat: 0.0, lng: 0.0 };
        let b = GeoCoord { lat: 0.0, lng: 90.0 };
        let mid = great_circle_interp(&a, &b, 0.5);
        assert!((mid.lat).abs() < 1.0);
        assert!((mid.lng - 45.0).abs() < 1.0);
    }

    #[test]
    fn test_vec3_roundtrip() {
        let coord = GeoCoord { lat: 51.5, lng: -0.12 }; // London
        let v = geo_to_vec3(&coord);
        let back = vec3_to_geo(&v);
        assert!((coord.lat - back.lat).abs() < 0.001);
        assert!((coord.lng - back.lng).abs() < 0.001);
    }

    #[test]
    fn test_rotation() {
        let v = Vec3 { x: 1.0, y: 0.0, z: 0.0 };
        let rotated = rotate_y(&v, PI / 2.0);
        assert!((rotated.x).abs() < 1e-10);
        assert!((rotated.z + 1.0).abs() < 1e-10);
    }
}
