# user-cred-v2: source symbols

Mechanically extracted declarations. Search the bundled source for declarations not captured by this index.

- [`user-cred-v2/Edge.scala:5`](../source/user-cred-v2/Edge.scala#L5) — `final case class Edge(sourceId: Long, destinationId: Long) {`
- [`user-cred-v2/Edge.scala:6`](../source/user-cred-v2/Edge.scala#L6) — `def asTuple: (Long, Long) =`
- [`user-cred-v2/Edge.scala:10`](../source/user-cred-v2/Edge.scala#L10) — `object Edge {`
- [`user-cred-v2/Edge.scala:13`](../source/user-cred-v2/Edge.scala#L13) — `def fromFlockEdge(edge: Flock.Edge): Option[Edge] = {`
- [`user-cred-v2/SnapshotSafeguard.scala:6`](../source/user-cred-v2/SnapshotSafeguard.scala#L6) — `final case class GateMetrics(`
- [`user-cred-v2/SnapshotSafeguard.scala:13`](../source/user-cred-v2/SnapshotSafeguard.scala#L13) — `final case class GateResult(`
- [`user-cred-v2/SnapshotSafeguard.scala:19`](../source/user-cred-v2/SnapshotSafeguard.scala#L19) — `object SnapshotSafeguard {`
- [`user-cred-v2/SnapshotSafeguard.scala:21`](../source/user-cred-v2/SnapshotSafeguard.scala#L21) — `def computeMetrics(`
- [`user-cred-v2/SnapshotSafeguard.scala:44`](../source/user-cred-v2/SnapshotSafeguard.scala#L44) — `def evaluate(`
- [`user-cred-v2/SnapshotSafeguard.scala:69`](../source/user-cred-v2/SnapshotSafeguard.scala#L69) — `private def relativeCheck(`
- [`user-cred-v2/UserCredV2.scala:3`](../source/user-cred-v2/UserCredV2.scala#L3) — `final case class UserCredV2(`
- [`user-cred-v2/UserCredV2.scala:9`](../source/user-cred-v2/UserCredV2.scala#L9) — `object UserCredV2 {`
- [`user-cred-v2/UserCredV2.scala:13`](../source/user-cred-v2/UserCredV2.scala#L13) — `def fromMass(id: Long, mass: Double): UserCredV2 = {`
- [`user-cred-v2/UserCredV2App.scala:18`](../source/user-cred-v2/UserCredV2App.scala#L18) — `class UserCredV2App {`
- [`user-cred-v2/UserCredV2App.scala:21`](../source/user-cred-v2/UserCredV2App.scala#L21) — `def runOnDateRange(dateRange: DateRange, config: UserCredV2Config): Execution[Unit] = {`
- [`user-cred-v2/UserCredV2App.scala:50`](../source/user-cred-v2/UserCredV2App.scala#L50) — `object UserCredV2App extends Logging {`
- [`user-cred-v2/UserCredV2App.scala:54`](../source/user-cred-v2/UserCredV2App.scala#L54) — `private def readValidUserInfoPipe(dateRange: DateRange): TypedPipe[ValidUserInfo] = {`
- [`user-cred-v2/UserCredV2App.scala:84`](../source/user-cred-v2/UserCredV2App.scala#L84) — `private def readEngagementEdges(dateRange: DateRange): TypedPipe[Edge] = {`
- [`user-cred-v2/UserCredV2App.scala:509`](../source/user-cred-v2/UserCredV2App.scala#L509) — `object UserCredV2AppAdhoc extends UserCredV2App with TwitterExecutionApp {`
- [`user-cred-v2/UserCredV2App.scala:511`](../source/user-cred-v2/UserCredV2App.scala#L511) — `override def job: Execution[Unit] = Execution.withArgs { args =>`
- [`user-cred-v2/UserCredV2App.scala:518`](../source/user-cred-v2/UserCredV2App.scala#L518) — `object UserCredV2AppProd extends UserCredV2App with TwitterScheduledExecutionApp {`
- [`user-cred-v2/UserCredV2App.scala:520`](../source/user-cred-v2/UserCredV2App.scala#L520) — `override def scheduledJob: Execution[Unit] = {`
- [`user-cred-v2/UserCredV2Config.scala:5`](../source/user-cred-v2/UserCredV2Config.scala#L5) — `final case class UserCredV2Config(`
- [`user-cred-v2/UserCredV2Config.scala:21`](../source/user-cred-v2/UserCredV2Config.scala#L21) — `def nextIteration: UserCredV2Config = this.copy(curIteration = curIteration + 1)`
- [`user-cred-v2/UserCredV2Config.scala:24`](../source/user-cred-v2/UserCredV2Config.scala#L24) — `object UserCredV2Config {`
- [`user-cred-v2/UserCredV2Config.scala:27`](../source/user-cred-v2/UserCredV2Config.scala#L27) — `def fromArgs(args: Args): UserCredV2Config = {`
- [`user-cred-v2/UserCredV2Injection.scala:8`](../source/user-cred-v2/UserCredV2Injection.scala#L8) — `object UserCredV2Injection {`
- [`user-cred-v2/UserMass.scala:3`](../source/user-cred-v2/UserMass.scala#L3) — `final case class UserMass(`
- [`user-cred-v2/UserMass.scala:7`](../source/user-cred-v2/UserMass.scala#L7) — `def toAggregate: Double = mass`
- [`user-cred-v2/UserMass.scala:10`](../source/user-cred-v2/UserMass.scala#L10) — `object UserMass {`
- [`user-cred-v2/UserMass.scala:11`](../source/user-cred-v2/UserMass.scala#L11) — `def calcInitMass(flatUser: ValidUserInfo): UserMass = {`
- [`user-cred-v2/UserNode.scala:3`](../source/user-cred-v2/UserNode.scala#L3) — `final case class UserNode(`
- [`user-cred-v2/ValidUserInfo.scala:5`](../source/user-cred-v2/ValidUserInfo.scala#L5) — `final case class ValidUserInfo(`
- [`user-cred-v2/ValidUserInfo.scala:14`](../source/user-cred-v2/ValidUserInfo.scala#L14) — `def isPremium: Boolean =`
- [`user-cred-v2/ValidUserInfo.scala:18`](../source/user-cred-v2/ValidUserInfo.scala#L18) — `object ValidUserInfo {`
- [`user-cred-v2/ValidUserInfo.scala:21`](../source/user-cred-v2/ValidUserInfo.scala#L21) — `def fromFlatUser(flatUser: FlatUser): Option[ValidUserInfo] = {`
