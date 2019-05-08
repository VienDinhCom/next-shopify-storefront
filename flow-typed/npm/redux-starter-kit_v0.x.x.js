// flow-typed signature: 9311681f13da4a37792b42741f9f9d81
// flow-typed version: de5b3a01c6/redux-starter-kit_v0.x.x/flow_>=v0.89.x

declare module 'redux-starter-kit' {
  declare export type PayloadAction<P: any, T: string = string> = {
    type: T,
    payload: P
  }
}
