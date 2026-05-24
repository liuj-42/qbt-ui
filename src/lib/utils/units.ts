// speed is always bytes and bits
// size is always bytes and binary units


export function format(unit: "bits" | "bytes" | "binary", number: number, decimals = 1): string {
    if (unit === "bits") {
        const units = ['b', 'kb', 'mb', 'gb', 'tb', 'pb'];
        if (!number) return `0 ${units[0]}`;
        const i = Math.floor(Math.log(number) / Math.log(1000));
        return `${parseFloat(((number * 8) / Math.pow(1000, i)).toFixed(decimals))} ${units[i]}`;
    }

    let units: string[] = [];
    let k = 0;
    if (unit === "bytes") {
        units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        k = 1000;
    } else if (unit === "binary") {
        units = ['BiB', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
        k = 1024;
    }

    if (!number) return `0 ${units[0]}`;
    const i = Math.floor(Math.log(number) / Math.log(k));
    return `${parseFloat((number / Math.pow(k, i)).toFixed(decimals))} ${units[i]}`;
}



export function formatBytes(bytes: number, decimals = 1): string {
	if (bytes === 0) return '0 B';

	const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	const k = 1000;
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${units[i]}`;
}

export function formatBits(bits: number, decimals = 1): string {
  if (bits === 0) return '0 b';

 	const units = ['b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'];
	const k = 128;
	const i = Math.floor(Math.log(bits) / Math.log(k));
 
	return `${parseFloat((bits / Math.pow(k, i)).toFixed(decimals))} ${units[i]}`;
}

export function formatBinary(bibytes: number, decimals = 1): string {
  if (bibytes === 0) return '0 BiB';

 	const units = ['BiB', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
	const k = 128;
	const i = Math.floor(Math.log(bibytes) / Math.log(k));
 
	return `${parseFloat((bibytes / Math.pow(k, i)).toFixed(decimals))} ${units[i]}`;
}