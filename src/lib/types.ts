export interface TransferStats {
	lifetime: number; // lifetime transfer amount
	session: number; // session transfer amount
	limit: number; // speed limit
	speed: number[]; // list of current speeds
	count: number; // number of active trasnfers
}

export interface torrentInfo {
	dlspeed: number;
	eta: number;
	f_l_piece_prio: boolean;
	force_start: boolean;
	hash: string;
	category: string;
	name: string;
	num_complete: number;
	num_incomplete: number;
	num_leeches: number;
	num_seeds: number;
	priority: number;
	progress: number;
	ratio: number;
	seq_dl: boolean;
	size: number;
	state: torrentState;
	super_seeding: boolean;
	upspeed: number;
	isPrivate: boolean;
}

export type torrentState =
	| 'error'
	| 'missingFiles'
	| 'uploading'
	| 'pausedUP'
	| 'queuedUP'
	| 'stalledUP'
	| 'checkingUP'
	| 'forcedUP'
	| 'allocating'
	| 'downloading'
	| 'metaDL'
	| 'pausedDL'
	| 'queuedDL'
	| 'stalledDL'
	| 'checkingDL'
	| 'forcedDL'
	| 'checkingResumeData'
	| 'moving'
	| 'unknown';
