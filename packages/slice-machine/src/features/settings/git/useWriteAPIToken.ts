import type { GitRepoSpecifier } from "@slicemachine/manager";

import { useSliceMachineConfig } from "@/hooks/useSliceMachineConfig";
import { managerClient } from "@/managerClient";

type UseWriteAPITokenReturnType = {
  updateToken: (token: string) => Promise<void>;
};

export function useWriteAPIToken(args: {
  git: GitRepoSpecifier;
}): UseWriteAPITokenReturnType {
  const [config] = useSliceMachineConfig();
  const repositoryName =
    typeof config.repositoryName === "string"
      ? config.repositoryName
      : config.repositoryName[0]; // FIXME: Don't hardcode.

  return {
    updateToken: async (token) => {
      await managerClient.git.updateWriteAPIToken({
        prismic: { domain: repositoryName },
        git: args.git,
        token,
      });
    },
  };
}
