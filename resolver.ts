@Injectable()
export class LoadHomePageSearchResolver implements Resolve<SearchResult> {

    constructor(
        private store: Store<fromFeatureHome.HomeState>,
        private loadPortsResolver: LoadPortsResolver,
        private loadShipGroupResolver: LoadShipGroupResolver
    ) {
       
    }

    private subscription$: Subscription;

    async resolve(): Promise<SearchResult> {
        const ports = await this.loadPortsResolver.resolve();
        const shipGroup = await this.loadShipGroupResolver.resolve();
        this.init(ports, shipGroup);
        this.subscription$.unsubscribe();
        return this.store.pipe(
            select(fromFeatureHome.getSelectedSearchResult),
            filter((data: SearchResult) => data && !_.isNil(data)),
            take(1)
        ).toPromise();
    }

    private init(ports$: Observable<PortInfo[]>, vesselGroups$: Observable<ShipGroupInfo[]>): void {
        forkJoin([
            ports$,
            vesselGroups$
        ]).pipe(
            map((observables: any[]) => {
                return ({
                    vesselGroups: (<ShipGroupInfo[]>observables[1]).map((ship: ShipGroupInfo) => ship.code),
                    ports: (<PortInfo[]>observables[0]).map((port: PortInfo) => port.code),
                    today: true
                } as SearchRequest)
            }),
            take(1)
        ).subscribe((request: SearchRequest) => {
                console.log(request);
                this.store.dispatch(
                    new fromFeatureHome.Search(
                        request
                    )
                )
            }
        );
    }

}
