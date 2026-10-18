/**
 * Convert a lease state enum value to the conventional string representation.
 * - 0 = Valid
 * - 1 = Declined
 * - 2 = Expired/Reclaimed
 * - 3 = Released
 * - 4 = Registered
 * @param state number An integer from 0-4 (inclusive) from Kea's lease state enum.
	 @return string The corresponding description of the lease state.
 */
export function stateToString(state: number): string {
    switch (state) {
        // For compatibility with the previous implementation.
        case null:
            return $localize`:@@lease-state.valid:Valid`
        case 0:
            return $localize`:@@lease-state.valid:Valid`
        case 1:
            return $localize`:@@lease-state.declined:Declined`
        case 2:
            return $localize`:@@lease-state.expired-reclaimed:Expired/Reclaimed`
        case 3:
            return $localize`:@@lease-state.released:Released`
        case 4:
            return $localize`:@@lease-state.registered:Registered`
        default:
            return $localize`:@@lease-state.invalid:(invalid state)`
    }
}

/**
 * Lease state information (a pairing of the human-readable name and the enum value).
 */
export interface LeaseState {
    name: string
    code: number
}

/**
 * List of all valid lease states.
 */
export let leaseStates: LeaseState[] = [
    { name: $localize`:@@lease-state.valid:Valid`, code: 0 },
    { name: $localize`:@@lease-state.declined:Declined`, code: 1 },
    { name: $localize`:@@lease-state.expired-reclaimed:Expired/Reclaimed`, code: 2 },
    { name: $localize`:@@lease-state.released:Released`, code: 3 },
    { name: $localize`:@@lease-state.registered:Registered`, code: 4 },
]
