import { AggregateData } from "../interfaces/AggregateData";

export const orgList: (keyof Omit<AggregateData, "updatedAt">)[] = [
  "naomi-lgbt",
  "nhcarrigan",
];
