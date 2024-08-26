import { revalidateData, useRequest } from "@prismicio/editor-support/Suspense";
import type { GitRepoSpecifier } from "@slicemachine/manager";

import { useSliceMachineConfig } from "@/hooks/useSliceMachineConfig";
import { managerClient } from "@/managerClient";

type UseLinkedGitReposReturnType = {
  linkedGitRepos: GitRepoSpecifier[];
  linkRepo: (git: GitRepoSpecifier) => Promise<void>;
  unlinkRepo: (git: GitRepoSpecifier) => Promise<void>;
};

export function useLinkedGitRepos(): UseLinkedGitReposReturnType {
  const [config] = useSliceMachineConfig();
  const repositoryName =
    typeof config.repositoryName === "string"
      ? config.repositoryName
      : config.repositoryName[0]; // FIXME: Don't hardcode.

  const linkedGitRepos = useRequest(getLinkedGitRepos, [repositoryName]);
  return {
    linkedGitRepos,
    linkRepo: async (git) => {
      await managerClient.git.linkRepo({
        prismic: { domain: repositoryName },
        git,
      });
      await revalidateData(getLinkedGitRepos, [repositoryName]);
    },
    unlinkRepo: async (git) => {
      await managerClient.git.unlinkRepo({
        prismic: { domain: repositoryName },
        git,
      });
      await revalidateData(getLinkedGitRepos, [repositoryName]);
    },
  };
}

async function getLinkedGitRepos(
  prismicDomain: string,
): Promise<GitRepoSpecifier[]> {
  return await managerClient.git.fetchLinkedRepos({
    prismic: { domain: prismicDomain },
  });
}
