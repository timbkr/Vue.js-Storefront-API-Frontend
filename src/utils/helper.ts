export function amountParser(amount: string): string {
    return parseFloat(amount).toFixed(2);
}

export function currencyCodeParser(currencyCode: string): string {
    if (currencyCode === "EUR") return "€";
    else return currencyCode;
}

export function filterNonNumeric(
    oldValue: number,
    event: Event,
    checkLowerThanZero?: boolean
): number {
    const newValue = (event.target as HTMLInputElement).value;
    //remove all nonNumeric Symbols (regex that matches all non numeric symbols)
    const filtered = newValue.toString().replace(/[^0-9]/g, "");
    if (filtered === "") {
        return oldValue;
    }
    if (checkLowerThanZero) {
        if (parseInt(filtered) < 1) {
            return oldValue;
        }
    }
    return parseInt(filtered);
}
