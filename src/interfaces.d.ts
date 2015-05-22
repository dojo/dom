export interface CreateArgs {
	[key: string]: string | { [key: string]: string };
	attributes: { [key: string]: string };
}