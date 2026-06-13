import { mockConcerts } from "../data/mockConcerts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchConcerts() {
  await wait(250);
  return mockConcerts;
}

export async function fetchConcertById(id: string) {
  await wait(150);
  return mockConcerts.find((concert) => concert.id === id);
}
