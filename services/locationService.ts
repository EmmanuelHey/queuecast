import * as Location from "expo-location";
import { Platform } from "react-native";
import { LocationCoordinates, LocationPermissionStatus, Venue } from "../types/queue";

export const DEFAULT_VERIFICATION_RADIUS_METERS = 300;

const mockDallasLocation: LocationCoordinates = {
  latitude: 32.7906,
  longitude: -96.8102,
};

export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  if (Platform.OS === "web") {
    return "granted";
  }

  try {
    const response = await Location.requestForegroundPermissionsAsync();
    return response.status === "granted" ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

export async function getCurrentLocation(useMockFallback = true): Promise<LocationCoordinates | null> {
  if (Platform.OS === "web") {
    return useMockFallback ? mockDallasLocation : null;
  }

  try {
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return useMockFallback ? mockDallasLocation : null;
  }
}

export function calculateDistanceToVenue(currentLocation: LocationCoordinates, venueLocation: LocationCoordinates) {
  const earthRadiusMeters = 6371000;
  const latitudeDelta = ((venueLocation.latitude - currentLocation.latitude) * Math.PI) / 180;
  const longitudeDelta = ((venueLocation.longitude - currentLocation.longitude) * Math.PI) / 180;
  const currentLatitude = (currentLocation.latitude * Math.PI) / 180;
  const venueLatitude = (venueLocation.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(currentLatitude) * Math.cos(venueLatitude) * Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function isWithinVenueRadius(distanceMeters: number, radiusMeters = DEFAULT_VERIFICATION_RADIUS_METERS) {
  return distanceMeters <= radiusMeters;
}

export async function verifyNearVenue(venue: Venue) {
  const permissionStatus = await requestLocationPermission();

  if (permissionStatus === "denied") {
    return { permissionStatus, verificationState: "denied" as const, distanceMeters: null };
  }

  const currentLocation = await getCurrentLocation(true);

  if (!currentLocation) {
    return { permissionStatus, verificationState: "unavailable" as const, distanceMeters: null };
  }

  const distanceMeters = calculateDistanceToVenue(currentLocation, venue.coordinates);

  return {
    permissionStatus,
    verificationState: isWithinVenueRadius(distanceMeters) ? ("verified_near_venue" as const) : ("too_far" as const),
    distanceMeters: Math.round(distanceMeters),
  };
}
