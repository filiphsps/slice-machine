import { useSelector } from "react-redux";

import { getApiEndpoint, getRepoNames } from "@/modules/environment";
import { SliceMachineStoreType } from "@/redux/type";

// TODO: This hook should be extracted to a new manager endpoint
export function useRepositoryInformation() {
  const { repositoryNames, apiEndpoint } = useSelector(
    (store: SliceMachineStoreType) => ({
      repositoryNames: getRepoNames(store),
      apiEndpoint: getApiEndpoint(store),
    }),
  );
  const repositoryDomain = new URL(
    apiEndpoint[0], // FIXME: Don't hardcode.
  ).hostname.replace(".cdn", "");
  const repositoryUrl = apiEndpoint[0] // FIXME: Don't hardcode.
    .replace(".cdn.", ".")
    .replace("/api/v2", "");

  return {
    repositoryNames,
    repositoryDomain,
    repositoryUrl,
  };
}
