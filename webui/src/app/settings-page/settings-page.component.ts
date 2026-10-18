import { Component, OnInit, inject } from '@angular/core'
import { FormControl, FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'

import { MessageService } from '@openng/optimus-ui/api'

import { SettingsService } from '../backend'
import { getErrorMessage } from '../utils'
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'
import { RouterLink } from '@angular/router'
import { Divider } from '@openng/optimus-ui/divider'

import { Fieldset } from '@openng/optimus-ui/fieldset'
import { Checkbox } from '@openng/optimus-ui/checkbox'
import { HelpTipComponent } from '../help-tip/help-tip.component'
import { InputNumber } from '@openng/optimus-ui/inputnumber'
import { InputText } from '@openng/optimus-ui/inputtext'
import { Button } from '@openng/optimus-ui/button'
import { ManagedAccessDirective } from '../managed-access.directive'
import { ProgressSpinner } from '@openng/optimus-ui/progressspinner'

/**
 * An interface specifying the form controls for the server settings.
 */
interface SettingsForm {
    statePullerInterval: FormControl<number>
    bind9StatsPullerInterval: FormControl<number>
    keaHostsPullerInterval: FormControl<number>
    keaStatsPullerInterval: FormControl<number>
    keaStatusPullerInterval: FormControl<number>
    keaLeasesPullerInterval: FormControl<number>
    enableZoneTransferPruning: FormControl<boolean>
    zoneTransferPruningMaxAge: FormControl<number>
    grafanaUrl: FormControl<string>
    grafanaDhcp4DashboardId: FormControl<string>
    grafanaDhcp6DashboardId: FormControl<string>
    enableMachineRegistration: FormControl<boolean>
    enableOnlineSoftwareVersions: FormControl<boolean>
}

/**
 * An interface holding information required to render a single
 * form control.
 */
interface SettingsItem {
    title: string
    formControlName: string
    help: string
}

/**
 * A component providing a form to specify server settings.
 */
@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.sass'],
    imports: [
        BreadcrumbsComponent,
        RouterLink,
        Divider,
        FormsModule,
        ReactiveFormsModule,
        Fieldset,
        Checkbox,
        HelpTipComponent,
        InputNumber,
        InputText,
        Button,
        ManagedAccessDirective,
        ProgressSpinner,
    ],
})
export class SettingsPageComponent implements OnInit {
    /**
     * Form builder instance.
     * @private
     */
    private fb = inject(FormBuilder)

    /**
     * A service for communicating with the server.
     * @private
     */
    private settingsApi = inject(SettingsService)

    /**
     * A message service.
     * @private
     */
    private msgSrv = inject(MessageService)

    /**
     * A path specified in the breadcrumbs.
     */
    breadcrumbs = [{ label: $localize`:@@menu.configuration:Configuration` }, { label: $localize`:@@menu.settings:Settings` }]

    /**
     * A list of interval settings to specify in the form.
     *
     * A numeric input form control is created for each setting in this
     * array. The value is validated with the required and min validators.
     * The expected value must be non-negative.
     */
    intervalSettings: SettingsItem[] = [
        {
            title: $localize`:@@settings.state-puller-interval:State puller interval`,
            formControlName: 'statePullerInterval',
            help: $localize`:@@settings.state-puller-interval-help:This puller refreshes the state of the daemons running on the monitored machines.`,
        },
        {
            title: $localize`:@@settings.bind9-stats-puller-interval:BIND 9 statistics puller interval`,
            formControlName: 'bind9StatsPullerInterval',
            help: $localize`:@@settings.bind9-stats-puller-interval-help:This puller refreshes statistics from the BIND 9 servers.`,
        },
        {
            title: $localize`:@@settings.kea-hosts-puller-interval:Kea hosts puller interval`,
            formControlName: 'keaHostsPullerInterval',
            help: $localize`:@@settings.kea-hosts-puller-interval-help:This puller fetches the host reservations from the Kea servers.`,
        },
        {
            title: $localize`:@@settings.kea-statistics-puller-interval:Kea statistics puller interval`,
            formControlName: 'keaStatsPullerInterval',
            help: $localize`:@@settings.kea-statistics-puller-interval-help:This puller refreshes statistics from the Kea servers.`,
        },
        {
            title: $localize`:@@settings.kea-status-puller-interval:Kea status puller interval`,
            formControlName: 'keaStatusPullerInterval',
            help: $localize`:@@settings.kea-status-puller-interval-help:This puller fetches the high availability status from the Kea servers.`,
        },
        {
            title: $localize`:@@settings.kea-leases-puller-interval:Kea leases puller interval`,
            formControlName: 'keaLeasesPullerInterval',
            help: $localize`:@@settings.kea-leases-puller-interval-help:This puller fetches leases from Kea servers.`,
        },
    ]

    /**
     * A list of URL settings to specify in the form.
     *
     * A URL input form control is created for each setting in this array.
     */
    grafanaUrlSettings: SettingsItem[] = [
        {
            title: $localize`:@@settings.grafana-url:URL to Grafana`,
            formControlName: 'grafanaUrl',
            help: $localize`:@@settings.grafana-url-help:Specifies a Grafana instance URL. It is optional.`,
        },
    ]

    /**
     * A list of text settings to specify in the form.
     *
     * A text input form control is created for each setting in this array.
     */
    grafanaTextSettings: SettingsItem[] = [
        {
            title: $localize`:@@settings.grafana-dhcp4-dashboard-id:ID of the DHCPv4 dashboard in Grafana`,
            formControlName: 'grafanaDhcp4DashboardId',
            help: $localize`:@@settings.grafana-dhcp4-dashboard-id-help:This ID must match the dashboard UID in the Grafana configuration. This value is used to construct the URL to the DHCPv4 dashboard.`,
        },
        {
            title: $localize`:@@settings.grafana-dhcp6-dashboard-id:ID of the DHCPv6 dashboard in Grafana`,
            formControlName: 'grafanaDhcp6DashboardId',
            help: $localize`:@@settings.grafana-dhcp6-dashboard-id-help:This ID must match the dashboard UID in the Grafana configuration. This value is used to construct the URL to the DHCPv6 dashboard.`,
        },
    ]

    /**
     * A form holding the settings.
     */
    settingsForm: FormGroup<SettingsForm>

    /**
     * A union defining form state.
     *
     * It controls what is rendered.
     */
    formState: 'loading' | 'fail' | 'success'

    /**
     * Constructor.
     */
    constructor() {
        this.settingsForm = this.fb.group({
            statePullerInterval: [0, [Validators.required, Validators.min(0)]],
            bind9StatsPullerInterval: [0, [Validators.required, Validators.min(0)]],
            keaHostsPullerInterval: [0, [Validators.required, Validators.min(0)]],
            keaStatsPullerInterval: [0, [Validators.required, Validators.min(0)]],
            keaStatusPullerInterval: [0, [Validators.required, Validators.min(0)]],
            keaLeasesPullerInterval: [0, [Validators.required, Validators.min(0)]],
            enableZoneTransferPruning: [false],
            zoneTransferPruningMaxAge: [604800, [Validators.required, Validators.min(60)]],
            grafanaUrl: [''],
            grafanaDhcp4DashboardId: ['hRf18FvWz'],
            grafanaDhcp6DashboardId: ['AQPHKJUGz'],
            enableMachineRegistration: [false],
            enableOnlineSoftwareVersions: [false],
        })
    }

    /**
     * Gathers the current settings from the server and initializes them
     * in the form.
     */
    private getSettings(): void {
        this.formState = 'loading'
        this.settingsApi.getSettings().subscribe({
            next: (data) => {
                this.settingsForm.patchValue(data)
                this.formState = 'success'
            },
            error: (err) => {
                this.formState = 'fail'
                const msg = getErrorMessage(err)
                this.msgSrv.add({
                    severity: 'error',
                    summary: $localize`:@@settings.fetch-failed:Cannot get settings`,
                    detail: $localize`:@@settings.fetch-failed-detail:Error getting settings: ${msg}:error message:`,
                    life: 10000,
                })
            },
        })
    }

    /**
     * A component lifecycle hook invoked upon the component initialization.
     *
     * It gathers the current settings from the server and initializes them
     * in the form.
     */
    ngOnInit() {
        this.getSettings()
    }

    /**
     * Retries gathering the settings after failure.
     */
    retry(): void {
        this.getSettings()
    }

    /**
     * Saves the current values of the settings in the backend.
     */
    saveSettings(): void {
        if (!this.settingsForm.valid) {
            return
        }
        const settings = this.settingsForm.getRawValue()

        this.settingsApi.updateSettings(settings).subscribe({
            next: (/* data */) => {
                this.msgSrv.add({
                    severity: 'success',
                    summary: $localize`:@@settings.updated:Settings updated`,
                    detail: $localize`:@@settings.update-succeeded:Updating settings succeeded.`,
                })
            },
            error: (err) => {
                const msg = getErrorMessage(err)
                this.msgSrv.add({
                    severity: 'error',
                    summary: $localize`:@@settings.save-failed:Cannot save settings`,
                    detail: $localize`:@@settings.save-failed-detail:Error saving settings: ${msg}:error message:`,
                    life: 10000,
                })
            },
        })
    }

    /**
     * Indicates if the given form field has assigned error with the
     * specific name.
     *
     * @param name control name.
     * @param errType error type name.
     * @returns A boolean value indicating if the control has the error.
     */
    hasError(name: string, errType: string): boolean {
        return !!this.settingsForm.get(name)?.hasError(errType)
    }
}
