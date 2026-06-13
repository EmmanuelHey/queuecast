import { mockConcerts, mockVenues } from "../data/mockConcerts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchConcerts() {
  await wait(250);
  return mockConcerts;
}

export async function fetchConcertById(id: string) {
  await wait(150);
  return mockConcerts.find((concert) => concert.id === id);
}

export async function fetchVenues() {
  await wait(180);
  return mockVenues;
}

export async function fetchVenueById(id: string) {
  await wait(120);
  return mockVenues.find((venue) => venue.id === id);
}
