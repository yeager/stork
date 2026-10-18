import { Component, input } from '@angular/core'
import { Lease } from '../backend'
import { Fieldset } from '@openng/optimus-ui/fieldset'
import { IdentifierComponent } from '../identifier/identifier.component'
import { JsonTreeRootComponent } from '../json-tree-root/json-tree-root.component'
import { LocaltimePipe } from '../pipes/localtime.pipe'

@Component({
    selector: 'app-lease-detail-box',
    imports: [Fieldset, IdentifierComponent, JsonTreeRootComponent, LocaltimePipe],
    templateUrl: './lease-detail-box.component.html',
    styleUrl: './lease-detail-box.component.sass',
})
export class LeaseDetailBoxComponent {
    readonly yes = $localize`:@@common.yes:yes`
    readonly no = $localize`:@@common.no:no`

    /**
     * The lease for which to display details.
     */
    lease = input<Lease>()
}
