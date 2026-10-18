import { Component, OnDestroy, OnInit, inject } from '@angular/core'
import { Router, RouterLink, RouterOutlet } from '@angular/router'
import { firstValueFrom, Observable, Subscription } from 'rxjs'

import { MenuItem, MessageService } from '@openng/optimus-ui/api'

import { GeneralService } from './backend/api/api'
import { AuthService } from './auth.service'
import { LoadingService } from './loading.service'
import { SettingService } from './setting.service'
import { ServerDataService } from './server-data.service'
import { Settings, User } from './backend'
import { ThemeService } from './theme.service'
import { Severity, VersionService } from './version.service'
import { AsyncPipe } from '@angular/common'
import { Menubar } from '@openng/optimus-ui/menubar'
import { Tooltip } from '@openng/optimus-ui/tooltip'
import { Ripple } from '@openng/optimus-ui/ripple'
import { ToggleButton } from '@openng/optimus-ui/togglebutton'
import { FormsModule } from '@angular/forms'
import { ProgressSpinner } from '@openng/optimus-ui/progressspinner'
import { GlobalSearchComponent } from './global-search/global-search.component'
import { SplitButton } from '@openng/optimus-ui/splitbutton'
import { PriorityErrorsPanelComponent } from './priority-errors-panel/priority-errors-panel.component'
import { Toast } from '@openng/optimus-ui/toast'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    imports: [
        Menubar,
        RouterLink,
        Tooltip,
        Ripple,
        ToggleButton,
        FormsModule,
        ProgressSpinner,
        GlobalSearchComponent,
        SplitButton,
        PriorityErrorsPanelComponent,
        Toast,
        RouterOutlet,
        AsyncPipe,
    ],
})
export class AppComponent implements OnInit, OnDestroy {
    private router = inject(Router)
    private serverData = inject(ServerDataService)
    protected generalApi = inject(GeneralService)
    private auth = inject(AuthService)
    private loadingService = inject(LoadingService)
    private settingSvc = inject(SettingService)
    private themeService = inject(ThemeService)
    private versionService = inject(VersionService)
    private messageService = inject(MessageService)

    storkVersion = 'unknown'
    storkBuildDate = 'unknown'
    currentUser: User = null
    loadingInProgress = new Observable()
    userMenuItems: MenuItem[]

    menuItems: MenuItem[]

    breadcrumbItems: MenuItem[]

    /**
     * Holds information if dark theme is applied.
     */
    isDark: boolean

    /**
     * Keeps all the RxJS subscriptions.
     */
    subscriptions: Subscription = new Subscription()

    /**
     * Flag stating whether to display badge for some menu items to drag user's attention about ISC software versions.
     * @private
     */
    private displaySwVersionBadge: boolean = false

    /**
     * Severity for the badge for some menu items to drag user's attention about ISC software versions.
     * @private
     */
    private swVersionBadgeSeverity: Severity

    /**
     * Custom style of the toggle button.
     */
    darkModeToggleButton = {
        root: {
            contentSmPadding: '0.25rem',
        },
    }

    /**
     * Top menubar style.
     */
    appMenubar = {
        root: {
            padding: '0',
            borderRadius: '0',
            background: '{primary.600}',
            borderColor: '{primary.600}',
        },
        colorScheme: {
            light: {
                root: {
                    mobileButtonColor: '{primary.contrast.color}',
                },
            },
        },
    }

    constructor() {
        this.initMenus()

        this.breadcrumbItems = [{ label: $localize`:@@navigation.categories:Categories` }]

        this.loadingInProgress = this.loadingService.getState()
    }

    initMenus() {
        this.userMenuItems = [
            {
                label: $localize`:@@menu.profile:Profile`,
                id: 'profile',
                icon: 'fa fa-cog',
                routerLink: '/profile',
            },
        ]

        this.menuItems = [
            {
                label: $localize`:@@menu.dhcp:DHCP`,
                id: 'dhcp',
                visible: false,
                items: [
                    {
                        label: $localize`:@@menu.dashboard:Dashboard`,
                        id: 'dashboard',
                        icon: 'fa fa-tachometer-alt',
                        routerLink: '/dashboard',
                    },
                    {
                        label: $localize`:@@menu.leasesSearch:Leases Search`,
                        id: 'leases-search',
                        icon: 'fa fa-search',
                        routerLink: '/dhcp/leases',
                    },
                    {
                        label: $localize`:@@menu.leasesList:Leases List`,
                        id: 'leases-list',
                        icon: 'fa fa-list',
                        routerLink: '/dhcp/leases-list',
                    },
                    {
                        label: $localize`:@@menu.hostReservations:Host Reservations`,
                        id: 'host-reservations',
                        icon: 'fa fa-laptop',
                        routerLink: '/dhcp/hosts',
                    },
                    {
                        label: $localize`:@@menu.subnets:Subnets`,
                        id: 'subnets',
                        icon: 'fa fa-project-diagram',
                        routerLink: '/dhcp/subnets',
                    },
                    {
                        label: $localize`:@@menu.sharedNetworks:Shared Networks`,
                        id: 'shared-networks',
                        icon: 'fa fa-network-wired',
                        routerLink: '/dhcp/shared-networks',
                    },
                    {
                        label: $localize`:@@menu.configMigrations:Config migrations`,
                        id: 'config-migrations',
                        routerLink: '/config-migrations',
                        icon: 'fa fa-suitcase',
                    },
                ],
            },
            {
                label: $localize`:@@menu.dns:DNS`,
                id: 'dns',
                visible: false,
                items: [
                    {
                        label: $localize`:@@menu.dashboard:Dashboard`,
                        id: 'dns-dashboard',
                        icon: 'fa fa-tachometer-alt',
                        routerLink: '/dashboard',
                    },
                    {
                        label: $localize`:@@menu.zones:Zones`,
                        id: 'zones',
                        icon: 'pi pi-sitemap',
                        routerLink: '/dns/zones',
                    },
                    {
                        label: $localize`:@@menu.zoneTransfers:Zone Transfers`,
                        id: 'zone-transfers',
                        icon: 'fa fa-exchange-alt',
                        routerLink: '/dns/zone-transfers',
                    },
                ],
            },
            {
                label: $localize`:@@menu.services:Services`,
                id: 'services',
                items: [
                    {
                        label: $localize`:@@menu.allDaemons:All Daemons`,
                        id: 'all-daemons',
                        visible: false,
                        icon: 'fa fa-server',
                        routerLink: '/daemons/all',
                    },
                    {
                        label: $localize`:@@menu.keaDaemons:Kea Daemons`,
                        id: 'kea-daemons',
                        visible: false,
                        icon: 'fa fa-server',
                        routerLink: '/daemons/all',
                        queryParams: { daemons: ['dhcp4', 'dhcp6', 'd2', 'ca', 'netconf'] },
                    },
                    {
                        label: $localize`:@@menu.dnsDaemons:DNS Daemons`,
                        id: 'dns-daemons',
                        visible: false,
                        icon: 'fa fa-server',
                        routerLink: '/daemons/all',
                        queryParams: { daemons: ['named', 'pdns'] },
                    },
                    {
                        label: $localize`:@@menu.machines:Machines`,
                        id: 'machines',
                        icon: 'fa fa-server',
                        routerLink: '/machines/all',
                        queryParams: { authorized: 'true' },
                    },
                    {
                        label: $localize`:@@menu.grafana:Grafana`,
                        id: 'grafana',
                        icon: 'pi pi-chart-line',
                        url: '',
                        visible: false,
                    },
                ],
            },
            {
                label: $localize`:@@menu.monitoring:Monitoring`,
                id: 'monitoring',
                items: [
                    {
                        label: $localize`:@@menu.events:Events`,
                        id: 'events',
                        icon: 'fa fa-calendar-times',
                        routerLink: '/events',
                    },
                    {
                        label: $localize`:@@menu.communication:Communication`,
                        id: 'communication',
                        icon: 'fa fa-signal',
                        routerLink: '/communication',
                    },
                    {
                        label: $localize`:@@menu.softwareVersions:Software versions`,
                        id: 'versions',
                        icon: 'pi pi-history',
                        routerLink: '/versions',
                    },
                ],
            },
            {
                label: $localize`:@@menu.configuration:Configuration`,
                id: 'configuration',
                items: [
                    {
                        label: $localize`:@@menu.users:Users`,
                        id: 'users',
                        visible: false,
                        icon: 'fa fa-user',
                        routerLink: '/users',
                    },
                    {
                        label: $localize`:@@menu.reviewCheckers:Review Checkers`,
                        id: 'checkers',
                        icon: 'fa fa-tasks',
                        routerLink: '/review-checkers',
                    },
                    {
                        label: $localize`:@@menu.settings:Settings`,
                        id: 'settings',
                        icon: 'fa fa-cog',
                        routerLink: '/settings',
                    },
                ],
            },
            {
                label: $localize`:@@menu.help:Help`,
                id: 'help',
                items: [
                    {
                        label: $localize`:@@menu.storkManual:Stork Manual`,
                        id: 'stork-manual',
                        icon: 'fa fa-book',
                        routerLink: '/assets/arm/index.html',
                        target: 'blank',
                    },
                    {
                        label: $localize`:@@menu.apiDocsSwagger:Stork API Docs (SwaggerUI)`,
                        id: 'stork-API-docs-swagger',
                        icon: 'fa fa-code',
                        routerLink: '/swagger-ui',
                    },
                    {
                        label: $localize`:@@menu.apiDocsRedoc:Stork API Docs (Redoc)`,
                        id: 'stork-API-docs-redoc',
                        icon: 'fa fa-code',
                        routerLink: '/api/docs',
                        target: 'blank',
                    },
                    {
                        label: $localize`:@@menu.bindManual:BIND 9 Manual`,
                        id: 'bind9-manual',
                        icon: 'fa fa-book',
                        url: 'https://bind9.readthedocs.io/',
                        target: 'blank',
                    },
                    {
                        label: $localize`:@@menu.keaManual:Kea Manual`,
                        id: 'kea-manual',
                        icon: 'fa fa-book',
                        url: 'https://kea.readthedocs.io/',
                        target: 'blank',
                    },
                ],
            },
        ]
    }

    /**
     * Get menu item or subitem from Stork menu based on provided name.
     *
     * @param name A menu item name that must exist in Stork menu tree
     *             that is defined in this.menuItems.
     * @returns A reference to found menu item or null if not found.
     */
    getMenuItemById(id: string) {
        for (const menuItem of this.menuItems) {
            if (menuItem['id'] === id) {
                return menuItem
            }
            for (const subMenu of menuItem.items) {
                if (subMenu['id'] === id) {
                    return subMenu
                }
            }
        }
        this.messageService.add({
            severity: 'error',
            summary: $localize`:@@error.menuItem:Error getting menu item`,
            detail: $localize`:@@error.menuItemNotFound:Menu item not found: ` + id,
            life: 10000,
        })
        return null
    }

    ngOnInit() {
        this.subscriptions.add(
            this.generalApi.getVersion().subscribe((data) => {
                this.storkVersion = data.version
                this.storkBuildDate = data.date
                this.versionService.setStorkServerVersion(data.version)
            })
        )

        this.subscriptions.add(
            this.versionService.getVersionAlert().subscribe((data) => {
                this.displaySwVersionBadge = data.detected
                this.swVersionBadgeSeverity = data.severity
                this.setMenuItemBadges()
            })
        )

        this.subscriptions.add(
            this.auth.currentUser$.subscribe((x) => {
                this.currentUser = x
                const menuItem = this.getMenuItemById('users')
                if (this.auth.superAdmin()) {
                    // super admin can see Configuration/Users menu
                    menuItem['visible'] = true
                } else {
                    menuItem['visible'] = false
                }
                // force refresh of top menu in UI
                this.menuItems = [...this.menuItems]

                // Only get the stats and settings when the user is logged in.
                if (this.auth.currentUserValue) {
                    // Use firstValueFrom to subscribe to the observable and unsubscribe as soon as first value arrives.
                    // This is to check Stork server updates and unsubscribe.
                    firstValueFrom(this.versionService.getCurrentData()).catch((err) =>
                        this.messageService.add({
                            severity: 'error',
                            summary: $localize`:@@error.softwareVersions:Error retrieving software versions data`,
                            detail:
                                $localize`:@@error.softwareVersionsDetail:Error occurred when retrieving software versions data: ` +
                                err,
                            life: 10000,
                        })
                    )

                    this.serverData.getDaemonsStats().subscribe((data) => {
                        // if there are Kea daemons then show DHCP/Kea menu items
                        // otherwise hide them
                        const dhcpMenuItem = this.getMenuItemById('dhcp')
                        const keaDaemonsMenuItem = this.getMenuItemById('kea-daemons')
                        if (data.dhcpDaemonsTotal) {
                            dhcpMenuItem.visible = true
                            keaDaemonsMenuItem['visible'] = true
                        } else {
                            dhcpMenuItem.visible = false
                            keaDaemonsMenuItem['visible'] = false
                        }
                        // if there are DNS daemons then show DNS related menu items
                        // otherwise hide them
                        const dnsDaemonsMenuItem = this.getMenuItemById('dns-daemons')
                        const dnsMenuItem = this.getMenuItemById('dns')
                        if (data.dnsDaemonsTotal) {
                            dnsDaemonsMenuItem['visible'] = true
                            dnsMenuItem['visible'] = true
                        } else {
                            dnsDaemonsMenuItem['visible'] = false
                            dnsMenuItem['visible'] = false
                        }
                        // if there are any of DHCP or DNS daemons, show related menu item; otherwise hide it
                        const allDaemonsMenuItem = this.getMenuItemById('all-daemons')
                        allDaemonsMenuItem['visible'] = !!(data.dnsDaemonsTotal || data.dhcpDaemonsTotal)

                        // force refresh of top menu in UI
                        this.menuItems = [...this.menuItems]
                    })

                    // If Grafana url is not empty, we need to make
                    // Services.Grafana menu choice visible and set it's url.
                    // Otherwise we need to make sure it's not visible.
                    this.settingSvc.getSettings().subscribe((data: Settings) => {
                        const grafanaUrl = data?.grafanaUrl

                        const grafanaMenuItem = this.getMenuItemById('grafana')

                        if (grafanaUrl && grafanaUrl !== '') {
                            grafanaMenuItem['visible'] = true
                            grafanaMenuItem['url'] = grafanaUrl
                        } else {
                            grafanaMenuItem['visible'] = false
                        }

                        // force refresh of top menu in UI
                        this.menuItems = [...this.menuItems]
                    })
                }
            })
        )

        // Subscribe to themeService isDark$ BehaviorSubject observable,
        // to get notified of dark/light mode change.
        this.subscriptions.add(
            this.themeService.isDark$.subscribe((isDark) => {
                this.isDark = isDark
            })
        )
        // Sets initial dark/light mode theme basing on user's preference and OS/browser settings.
        this.setInitialTheme()
    }

    /**
     * Does a cleanup when the component is destroyed.
     */
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    signOut() {
        this.router.navigate(['/logout'])
    }

    /**
     * Communicates with themeService to change stork UI dark/light mode.
     * User's preference is stored in browser's local storage.
     * @param isDark when true provided, dark mode is enabled; otherwise light mode is enabled
     */
    changeTheme(isDark: boolean = false): void {
        this.themeService.switchTheme(isDark)
        this.themeService.storeTheme()
    }

    /**
     * Communicates with themeService to set the initial dark/light mode theme
     * basing on user's preference and OS/browser settings.
     */
    setInitialTheme(): void {
        this.themeService.setInitialTheme()
    }

    /**
     * Returns appropriate class to style the badge basing on the severity.
     */
    get swVersionBadgeClass() {
        return this.swVersionBadgeSeverity === Severity.error ? 'p-badge-danger' : 'p-badge-warn'
    }

    /**
     * Enables or disable badges for some top menubar menu items and styles them appropriately.
     */
    setMenuItemBadges() {
        if (this.displaySwVersionBadge) {
            let item = this.getMenuItemById('versions')
            item.badge = ' '
            item.badgeStyleClass = 'p-badge p-badge-dot ml-1 mb-2 ' + this.swVersionBadgeClass

            item = this.getMenuItemById('monitoring')
            item.badge = ' '
            item.badgeStyleClass = 'p-badge p-badge-dot ml-1 mb-2 ' + this.swVersionBadgeClass
        } else {
            let i = this.getMenuItemById('versions')
            i.badge = undefined
            i = this.getMenuItemById('monitoring')
            i.badge = undefined
        }

        this.menuItems = [...this.menuItems]
    }
}
