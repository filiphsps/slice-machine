export type Owner = {
	provider: "gitHub";
	id: string;
	name: string;
	// If type is null, the owner's type could not be determined. This can
	// happen if a Git provider uses an owner type that we do not support.
	// Owners with a null type should still be usable like any other owner.
	type: "user" | "team" | null;
};

export type GitRepo = {
	provider: "gitHub";
	id: string;
	owner: string;
	name: string;
	url: string;
	pushedAt: Date;
};

export type GitRepoSpecifier = {
	provider: "gitHub";
	owner: string;
	name: string;
};