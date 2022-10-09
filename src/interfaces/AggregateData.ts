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
  beccalyria: {
    issues: FilteredIssue[];
    pulls: FilteredPull[];
  };
  rosalianightsong: {
    issues: FilteredIssue[];
    pulls: FilteredPull[];
  };
  nhcommunity: {
    issues: FilteredIssue[];
    pulls: FilteredPull[];
  };
  beccalia: {
    issues: FilteredIssue[];
    pulls: FilteredPull[];
  };
}
