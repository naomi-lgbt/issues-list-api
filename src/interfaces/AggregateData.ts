import { FilteredIssue } from "./FilteredIssue";
import { FilteredPull } from "./FilteredPull";

export interface AggregateData {
  "naomi-lgbt": {
    issues: FilteredIssue[];
    pulls: FilteredPull[];
  };
  nhcarrigan: {
    issues: FilteredIssue[];
    pulls: FilteredPull[];
  };
  updatedAt: number;
}
