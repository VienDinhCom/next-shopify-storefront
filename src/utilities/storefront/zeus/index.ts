/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const';
export const HOST = "https://graphql.myshopify.com/api/2023-01/graphql.json"


export const HEADERS = {}
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + '?query=' + encodeURIComponent(query);
    const wsString = queryString.replace('http', 'ws');
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error('No websockets implemented');
  }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = '',
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return '';
    }
    if (typeof o === 'boolean' || typeof o === 'number') {
      return k;
    }
    if (typeof o === 'string') {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join('\n');
    }
    const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
    const keyForDirectives = o.__directives ?? '';
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map((e) => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars))
      .join('\n')}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars.map((v) => `${v.name}: ${v.graphQLType}`).join(', ');
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ''} ${query}`;
  };
  return ibb;
};

export const Thunder =
  (fn: FetchFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(o: Z | ValueTypes[R], ops?: OperationOptions & { variables?: Record<string, unknown> }) =>
    fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (graphqlOptions?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: graphqlOptions.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(o: Z | ValueTypes[R], ops?: OperationOptions & { variables?: ExtractVariables<Z> }) => {
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
    if (returnedFunction?.on && graphqlOptions?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
          if (graphqlOptions?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: graphqlOptions.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: Z | ValueTypes[R],
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    'Content-Type': 'application/json',
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(initialOp as string, ops[initialOp], initialZeusQuery);
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(initialOp as string, response, [ops[initialOp]]);
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (k: string, o: InputValueType | VType, p: string[] = []): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder = resolvers[currentScalarString.split('.')[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string' || !o) {
      return o;
    }
    const entries = Object.entries(o).map(([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const);
    const objectFromEntries = entries.reduce<Record<string, unknown>>((a, [k, v]) => {
      a[k] = v;
      return a;
    }, {});
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | 'enum'
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, unknown>) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super('');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? typeof Ops[O] : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (mappedParts: string[], returns: ReturnTypesType): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === 'object') {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({ ops, returns }: { returns: ReturnTypesType; ops: Operations }) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith('scalar')) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment ? pOriginals : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');

const mapPart = (p: string) => {
  const [isArg, isField] = p.split('<>');
  if (isField) {
    return {
      v: isField,
      __type: 'field',
    } as const;
  }
  return {
    v: isArg,
    __type: 'arg',
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === 'enum' && mappedParts.length === 1) {
      return 'enum';
    }
    if (typeof propsP1 === 'string' && propsP1.startsWith('scalar.') && mappedParts.length === 1) {
      return propsP1;
    }
    if (typeof propsP1 === 'object') {
      if (mappedParts.length < 2) {
        return 'not';
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === 'string') {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === 'object') {
        if (mappedParts.length < 3) {
          return 'not';
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === 'arg') {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return 'not';
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === 'object') {
      if (mappedParts.length < 2) return 'not';
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): 'enum' | 'not' | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return 'not';
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = '', root = true): string => {
    if (typeof a === 'string') {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a.replace(START_VAR_NAME, '$').split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith('scalar.')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split('.');
      const scalarKey = splittedScalar.join('.');
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(', ')}]`;
    }
    if (typeof a === 'string') {
      if (checkType === 'enum') {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === 'object') {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(',\n');
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <X, T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
  T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends 'scalar' & { name: infer T }
  ? T extends keyof SCLR
    ? SCLR[T]['decode'] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]['decode']>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
  ? InputType<R, U, SCLR>[]
  : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<SRC extends DeepAnify<DST>, DST, SCLR extends ScalarDefinition> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P], SCLR>
          : IsArray<R, '__typename' extends keyof DST ? { __typename: true } : never, SCLR>
        : never;
    }[keyof SRC] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
          }[keyof DST]
        >,
        '__typename'
      >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? IsScalar<SRC[P], SCLR> : IsArray<SRC[P], DST[P], SCLR>;
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver
        ? IsScalar<SRC[P], SCLR>
        : IsArray<SRC[P], DST[P], SCLR>;
    };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST, SCLR>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
    } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>, SCLR>
  : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<SELECTOR, NAME extends keyof GraphQLTypes, SCLR extends ScalarDefinition = {}> = InputType<
  GraphQLTypes[NAME],
  SELECTOR,
  SCLR
>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
  ['String']: string;
  ['Int']: number;
  ['Float']: number;
  ['ID']: unknown;
  ['Boolean']: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> = `${T}!` | T | `[${T}]` | `[${T}]!` | `[${T}!]` | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
  ? R1 extends VR<infer R2>
    ? R2 extends VR<infer R3>
      ? R3 extends VR<infer R4>
        ? R4 extends VR<infer R5>
          ? R5
          : R4
        : R3
      : R2
    : R1
  : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
  ? NonNullable<DecomposeType<R, Type>>
  : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> = T extends keyof ZEUS_VARIABLES
  ? ZEUS_VARIABLES[T]
  : T extends keyof BuiltInVariableTypes
  ? BuiltInVariableTypes[T]
  : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> & WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  ' __zeus_name': Name;
  ' __zeus_type': T;
};

export type ExtractVariables<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends [infer Inputs, infer Outputs]
  ? ExtractVariables<Inputs> & ExtractVariables<Outputs>
  : Query extends string | number | boolean
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>> }[keyof Query]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(name: Name, graphqlType: Type) => {
  return (START_VAR_NAME + name + GRAPHQL_TYPE_SEPARATOR + graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = GraphQLTypes["CartDiscountAllocation"] | GraphQLTypes["DiscountApplication"] | GraphQLTypes["DisplayableError"] | GraphQLTypes["HasMetafields"] | GraphQLTypes["Media"] | GraphQLTypes["Node"] | GraphQLTypes["OnlineStorePublishable"]
export type ScalarCoders = {
	Color?: ScalarResolver;
	DateTime?: ScalarResolver;
	Decimal?: ScalarResolver;
	HTML?: ScalarResolver;
	JSON?: ScalarResolver;
	URL?: ScalarResolver;
	UnsignedInt64?: ScalarResolver;
}
type ZEUS_UNIONS = GraphQLTypes["DeliveryAddress"] | GraphQLTypes["Merchandise"] | GraphQLTypes["MetafieldParentResource"] | GraphQLTypes["MetafieldReference"] | GraphQLTypes["PricingValue"] | GraphQLTypes["SellingPlanCheckoutChargeValue"] | GraphQLTypes["SellingPlanPriceAdjustmentValue"]

export type ValueTypes = {
    /** A version of the API, as defined by [Shopify API versioning](https://shopify.dev/api/usage/versioning).
Versions are commonly referred to by their handle (for example, `2021-10`).
 */
["ApiVersion"]: AliasType<{
	/** The human-readable name of the version. */
	displayName?:boolean | `@${string}`,
	/** The unique identifier of an ApiVersion. All supported API versions have a date-based (YYYY-MM) or `unstable` handle. */
	handle?:boolean | `@${string}`,
	/** Whether the version is actively supported by Shopify. Supported API versions are guaranteed to be stable. Unsupported API versions include unstable, release candidate, and end-of-life versions that are marked as unsupported. For more information, refer to [Versioning](https://shopify.dev/api/usage/versioning). */
	supported?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Details about the gift card used on the checkout. */
["AppliedGiftCard"]: AliasType<{
	/** The amount that was taken from the gift card by applying it. */
	amountUsed?:ValueTypes["MoneyV2"],
	/** The amount that was taken from the gift card by applying it. */
	amountUsedV2?:ValueTypes["MoneyV2"],
	/** The amount left on the gift card. */
	balance?:ValueTypes["MoneyV2"],
	/** The amount left on the gift card. */
	balanceV2?:ValueTypes["MoneyV2"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The last characters of the gift card. */
	lastCharacters?:boolean | `@${string}`,
	/** The amount that was applied to the checkout in its currency. */
	presentmentAmountUsed?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** An article in an online store blog. */
["Article"]: AliasType<{
	/** The article's author. */
	author?:ValueTypes["ArticleAuthor"],
	/** The article's author. */
	authorV2?:ValueTypes["ArticleAuthor"],
	/** The blog that the article belongs to. */
	blog?:ValueTypes["Blog"],
comments?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["CommentConnection"]],
content?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null | Variable<any, string>},boolean | `@${string}`],
	/** The content of the article, complete with HTML formatting. */
	contentHtml?:boolean | `@${string}`,
excerpt?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null | Variable<any, string>},boolean | `@${string}`],
	/** The excerpt of the article, complete with HTML formatting. */
	excerptHtml?:boolean | `@${string}`,
	/** A human-friendly unique string for the Article automatically generated from its title.
 */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The image associated with the article. */
	image?:ValueTypes["Image"],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
	/** The date and time when the article was published. */
	publishedAt?:boolean | `@${string}`,
	/** The article’s SEO information. */
	seo?:ValueTypes["SEO"],
	/** A categorization that a article can be tagged with. */
	tags?:boolean | `@${string}`,
	/** The article’s name. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The author of an article. */
["ArticleAuthor"]: AliasType<{
	/** The author's bio. */
	bio?:boolean | `@${string}`,
	/** The author’s email. */
	email?:boolean | `@${string}`,
	/** The author's first name. */
	firstName?:boolean | `@${string}`,
	/** The author's last name. */
	lastName?:boolean | `@${string}`,
	/** The author's full name. */
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Articles.
 */
["ArticleConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["ArticleEdge"],
	/** A list of the nodes contained in ArticleEdge. */
	nodes?:ValueTypes["Article"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Article and a cursor during pagination.
 */
["ArticleEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of ArticleEdge. */
	node?:ValueTypes["Article"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Article query. */
["ArticleSortKeys"]:ArticleSortKeys;
	/** Represents a generic custom attribute. */
["Attribute"]: AliasType<{
	/** Key or name of the attribute. */
	key?:boolean | `@${string}`,
	/** Value of the attribute. */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for an attribute. */
["AttributeInput"]: {
	/** Key or name of the attribute. */
	key: string | Variable<any, string>,
	/** Value of the attribute. */
	value: string | Variable<any, string>
};
	/** Automatic discount applications capture the intentions of a discount that was automatically applied.
 */
["AutomaticDiscountApplication"]: AliasType<{
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The title of the application. */
	title?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ValueTypes["PricingValue"],
		__typename?: boolean | `@${string}`
}>;
	/** A collection of available shipping rates for a checkout. */
["AvailableShippingRates"]: AliasType<{
	/** Whether or not the shipping rates are ready.
The `shippingRates` field is `null` when this value is `false`.
This field should be polled until its value becomes `true`.
 */
	ready?:boolean | `@${string}`,
	/** The fetched shipping rates. `null` until the `ready` field is `true`. */
	shippingRates?:ValueTypes["ShippingRate"],
		__typename?: boolean | `@${string}`
}>;
	/** An online store blog. */
["Blog"]: AliasType<{
articleByHandle?: [{	/** The handle of the article. */
	handle: string | Variable<any, string>},ValueTypes["Article"]],
articles?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["ArticleSortKeys"] | undefined | null | Variable<any, string>,	/** Supported filter parameters:
 - `author`
 - `blog_title`
 - `created_at`
 - `tag`
 - `tag_not`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null | Variable<any, string>},ValueTypes["ArticleConnection"]],
	/** The authors who have contributed to the blog. */
	authors?:ValueTypes["ArticleAuthor"],
	/** A human-friendly unique string for the Blog automatically generated from its title.
 */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
	/** The blog's SEO information. */
	seo?:ValueTypes["SEO"],
	/** The blogs’s title. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Blogs.
 */
["BlogConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["BlogEdge"],
	/** A list of the nodes contained in BlogEdge. */
	nodes?:ValueTypes["Blog"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Blog and a cursor during pagination.
 */
["BlogEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of BlogEdge. */
	node?:ValueTypes["Blog"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Blog query. */
["BlogSortKeys"]:BlogSortKeys;
	/** The store's [branding configuration](https://help.shopify.com/en/manual/promoting-marketing/managing-brand-assets).
 */
["Brand"]: AliasType<{
	/** The colors of the store's brand. */
	colors?:ValueTypes["BrandColors"],
	/** The store's cover image. */
	coverImage?:ValueTypes["MediaImage"],
	/** The store's default logo. */
	logo?:ValueTypes["MediaImage"],
	/** The store's short description. */
	shortDescription?:boolean | `@${string}`,
	/** The store's slogan. */
	slogan?:boolean | `@${string}`,
	/** The store's preferred logo for square UI elements. */
	squareLogo?:ValueTypes["MediaImage"],
		__typename?: boolean | `@${string}`
}>;
	/** A group of related colors for the shop's brand.
 */
["BrandColorGroup"]: AliasType<{
	/** The background color. */
	background?:boolean | `@${string}`,
	/** The foreground color. */
	foreground?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The colors of the shop's brand.
 */
["BrandColors"]: AliasType<{
	/** The shop's primary brand colors. */
	primary?:ValueTypes["BrandColorGroup"],
	/** The shop's secondary brand colors. */
	secondary?:ValueTypes["BrandColorGroup"],
		__typename?: boolean | `@${string}`
}>;
	/** Card brand, such as Visa or Mastercard, which can be used for payments. */
["CardBrand"]:CardBrand;
	/** A cart represents the merchandise that a buyer intends to purchase,
and the estimated cost associated with the cart. Learn how to
[interact with a cart](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
during a customer's session.
 */
["Cart"]: AliasType<{
attribute?: [{	/** The key of the attribute. */
	key: string | Variable<any, string>},ValueTypes["Attribute"]],
	/** The attributes associated with the cart. Attributes are represented as key-value pairs. */
	attributes?:ValueTypes["Attribute"],
	/** Information about the buyer that is interacting with the cart. */
	buyerIdentity?:ValueTypes["CartBuyerIdentity"],
	/** The URL of the checkout for the cart. */
	checkoutUrl?:boolean | `@${string}`,
	/** The estimated costs that the buyer will pay at checkout. The costs are subject to change and changes will be reflected at checkout. The `cost` field uses the `buyerIdentity` field to determine [international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing). */
	cost?:ValueTypes["CartCost"],
	/** The date and time when the cart was created. */
	createdAt?:boolean | `@${string}`,
deliveryGroups?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["CartDeliveryGroupConnection"]],
	/** The discounts that have been applied to the entire cart. */
	discountAllocations?:ValueTypes["CartDiscountAllocation"],
	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes?:ValueTypes["CartDiscountCode"],
	/** The estimated costs that the buyer will pay at checkout.
The estimated costs are subject to change and changes will be reflected at checkout.
The `estimatedCost` field uses the `buyerIdentity` field to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
	estimatedCost?:ValueTypes["CartEstimatedCost"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
lines?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["CartLineConnection"]],
	/** A note that is associated with the cart. For example, the note can be a personalized message to the buyer. */
	note?:boolean | `@${string}`,
	/** The total number of items in the cart. */
	totalQuantity?:boolean | `@${string}`,
	/** The date and time when the cart was updated. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartAttributesUpdate` mutation. */
["CartAttributesUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ValueTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The discounts automatically applied to the cart line based on prerequisites that have been met. */
["CartAutomaticDiscountAllocation"]: AliasType<{
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount?:ValueTypes["MoneyV2"],
	/** The title of the allocated discount. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents information about the buyer that is interacting with the cart. */
["CartBuyerIdentity"]: AliasType<{
	/** The country where the buyer is located. */
	countryCode?:boolean | `@${string}`,
	/** The customer account associated with the cart. */
	customer?:ValueTypes["Customer"],
	/** An ordered set of delivery addresses tied to the buyer that is interacting with the cart.
The rank of the preferences is determined by the order of the addresses in the array. Preferences
can be used to populate relevant fields in the checkout flow.
 */
	deliveryAddressPreferences?:ValueTypes["DeliveryAddress"],
	/** The email address of the buyer that is interacting with the cart. */
	email?:boolean | `@${string}`,
	/** The phone number of the buyer that is interacting with the cart. */
	phone?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Specifies the input fields to update the buyer information associated with a cart.
Buyer identity is used to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
and should match the customer's shipping address.
 */
["CartBuyerIdentityInput"]: {
	/** The email address of the buyer that is interacting with the cart. */
	email?: string | undefined | null | Variable<any, string>,
	/** The phone number of the buyer that is interacting with the cart. */
	phone?: string | undefined | null | Variable<any, string>,
	/** The country where the buyer is located. */
	countryCode?: ValueTypes["CountryCode"] | undefined | null | Variable<any, string>,
	/** The access token used to identify the customer associated with the cart. */
	customerAccessToken?: string | undefined | null | Variable<any, string>,
	/** An ordered set of delivery addresses tied to the buyer that is interacting with the cart.
The rank of the preferences is determined by the order of the addresses in the array. Preferences
can be used to populate relevant fields in the checkout flow.
 */
	deliveryAddressPreferences?: Array<ValueTypes["DeliveryAddressInput"]> | undefined | null | Variable<any, string>
};
	/** Return type for `cartBuyerIdentityUpdate` mutation. */
["CartBuyerIdentityUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ValueTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The discount that has been applied to the cart line using a discount code. */
["CartCodeDiscountAllocation"]: AliasType<{
	/** The code used to apply the discount. */
	code?:boolean | `@${string}`,
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The costs that the buyer will pay at checkout.
The cart cost uses [`CartBuyerIdentity`](https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity) to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
["CartCost"]: AliasType<{
	/** The estimated amount, before taxes and discounts, for the customer to pay at checkout. The checkout charge amount doesn't include any deferred payments that'll be paid at a later date. If the cart has no deferred payments, then the checkout charge amount is equivalent to `subtotalAmount`. */
	checkoutChargeAmount?:ValueTypes["MoneyV2"],
	/** The amount, before taxes and cart-level discounts, for the customer to pay. */
	subtotalAmount?:ValueTypes["MoneyV2"],
	/** Whether the subtotal amount is estimated. */
	subtotalAmountEstimated?:boolean | `@${string}`,
	/** The total amount for the customer to pay. */
	totalAmount?:ValueTypes["MoneyV2"],
	/** Whether the total amount is estimated. */
	totalAmountEstimated?:boolean | `@${string}`,
	/** The duty amount for the customer to pay at checkout. */
	totalDutyAmount?:ValueTypes["MoneyV2"],
	/** Whether the total duty amount is estimated. */
	totalDutyAmountEstimated?:boolean | `@${string}`,
	/** The tax amount for the customer to pay at checkout. */
	totalTaxAmount?:ValueTypes["MoneyV2"],
	/** Whether the total tax amount is estimated. */
	totalTaxAmountEstimated?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartCreate` mutation. */
["CartCreatePayload"]: AliasType<{
	/** The new cart. */
	cart?:ValueTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The discounts automatically applied to the cart line based on prerequisites that have been met. */
["CartCustomDiscountAllocation"]: AliasType<{
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount?:ValueTypes["MoneyV2"],
	/** The title of the allocated discount. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Information about the options available for one or more line items to be delivered to a specific address. */
["CartDeliveryGroup"]: AliasType<{
cartLines?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["CartLineConnection"]],
	/** The destination address for the delivery group. */
	deliveryAddress?:ValueTypes["MailingAddress"],
	/** The delivery options available for the delivery group. */
	deliveryOptions?:ValueTypes["CartDeliveryOption"],
	/** The ID for the delivery group. */
	id?:boolean | `@${string}`,
	/** The selected delivery option for the delivery group. */
	selectedDeliveryOption?:ValueTypes["CartDeliveryOption"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple CartDeliveryGroups.
 */
["CartDeliveryGroupConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["CartDeliveryGroupEdge"],
	/** A list of the nodes contained in CartDeliveryGroupEdge. */
	nodes?:ValueTypes["CartDeliveryGroup"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one CartDeliveryGroup and a cursor during pagination.
 */
["CartDeliveryGroupEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CartDeliveryGroupEdge. */
	node?:ValueTypes["CartDeliveryGroup"],
		__typename?: boolean | `@${string}`
}>;
	/** Information about a delivery option. */
["CartDeliveryOption"]: AliasType<{
	/** The code of the delivery option. */
	code?:boolean | `@${string}`,
	/** The method for the delivery option. */
	deliveryMethodType?:boolean | `@${string}`,
	/** The description of the delivery option. */
	description?:boolean | `@${string}`,
	/** The estimated cost for the delivery option. */
	estimatedCost?:ValueTypes["MoneyV2"],
	/** The unique identifier of the delivery option. */
	handle?:boolean | `@${string}`,
	/** The title of the delivery option. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The discounts that have been applied to the cart line. */
["CartDiscountAllocation"]:AliasType<{
		/** The discounted amount that has been applied to the cart line. */
	discountedAmount?:ValueTypes["MoneyV2"];
		['...on CartAutomaticDiscountAllocation']?: Omit<ValueTypes["CartAutomaticDiscountAllocation"],keyof ValueTypes["CartDiscountAllocation"]>;
		['...on CartCodeDiscountAllocation']?: Omit<ValueTypes["CartCodeDiscountAllocation"],keyof ValueTypes["CartDiscountAllocation"]>;
		['...on CartCustomDiscountAllocation']?: Omit<ValueTypes["CartCustomDiscountAllocation"],keyof ValueTypes["CartDiscountAllocation"]>;
		__typename?: boolean | `@${string}`
}>;
	/** The discount codes applied to the cart. */
["CartDiscountCode"]: AliasType<{
	/** Whether the discount code is applicable to the cart's current contents. */
	applicable?:boolean | `@${string}`,
	/** The code for the discount. */
	code?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartDiscountCodesUpdate` mutation. */
["CartDiscountCodesUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ValueTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Possible error codes that can be returned by `CartUserError`. */
["CartErrorCode"]:CartErrorCode;
	/** The estimated costs that the buyer will pay at checkout.
The estimated cost uses
[`CartBuyerIdentity`](https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity)
to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
["CartEstimatedCost"]: AliasType<{
	/** The estimated amount, before taxes and discounts, for the customer to pay at checkout. The checkout charge amount doesn't include any deferred payments that'll be paid at a later date. If the cart has no deferred payments, then the checkout charge amount is equivalent to`subtotal_amount`. */
	checkoutChargeAmount?:ValueTypes["MoneyV2"],
	/** The estimated amount, before taxes and discounts, for the customer to pay. */
	subtotalAmount?:ValueTypes["MoneyV2"],
	/** The estimated total amount for the customer to pay. */
	totalAmount?:ValueTypes["MoneyV2"],
	/** The estimated duty amount for the customer to pay at checkout. */
	totalDutyAmount?:ValueTypes["MoneyV2"],
	/** The estimated tax amount for the customer to pay at checkout. */
	totalTaxAmount?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create a cart. */
["CartInput"]: {
	/** An array of key-value pairs that contains additional information about the cart. */
	attributes?: Array<ValueTypes["AttributeInput"]> | undefined | null | Variable<any, string>,
	/** A list of merchandise lines to add to the cart. */
	lines?: Array<ValueTypes["CartLineInput"]> | undefined | null | Variable<any, string>,
	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes?: Array<string> | undefined | null | Variable<any, string>,
	/** A note that is associated with the cart. For example, the note can be a personalized message to the buyer. */
	note?: string | undefined | null | Variable<any, string>,
	/** The customer associated with the cart. Used to determine [international pricing]
(https://shopify.dev/custom-storefronts/internationalization/international-pricing).
Buyer identity should match the customer's shipping address.
 */
	buyerIdentity?: ValueTypes["CartBuyerIdentityInput"] | undefined | null | Variable<any, string>
};
	/** Represents information about the merchandise in the cart. */
["CartLine"]: AliasType<{
attribute?: [{	/** The key of the attribute. */
	key: string | Variable<any, string>},ValueTypes["Attribute"]],
	/** The attributes associated with the cart line. Attributes are represented as key-value pairs. */
	attributes?:ValueTypes["Attribute"],
	/** The cost of the merchandise that the buyer will pay for at checkout. The costs are subject to change and changes will be reflected at checkout. */
	cost?:ValueTypes["CartLineCost"],
	/** The discounts that have been applied to the cart line. */
	discountAllocations?:ValueTypes["CartDiscountAllocation"],
	/** The estimated cost of the merchandise that the buyer will pay for at checkout. The estimated costs are subject to change and changes will be reflected at checkout. */
	estimatedCost?:ValueTypes["CartLineEstimatedCost"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The merchandise that the buyer intends to purchase. */
	merchandise?:ValueTypes["Merchandise"],
	/** The quantity of the merchandise that the customer intends to purchase. */
	quantity?:boolean | `@${string}`,
	/** The selling plan associated with the cart line and the effect that each selling plan has on variants when they're purchased. */
	sellingPlanAllocation?:ValueTypes["SellingPlanAllocation"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple CartLines.
 */
["CartLineConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["CartLineEdge"],
	/** A list of the nodes contained in CartLineEdge. */
	nodes?:ValueTypes["CartLine"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** The cost of the merchandise line that the buyer will pay at checkout. */
["CartLineCost"]: AliasType<{
	/** The amount of the merchandise line. */
	amountPerQuantity?:ValueTypes["MoneyV2"],
	/** The compare at amount of the merchandise line. */
	compareAtAmountPerQuantity?:ValueTypes["MoneyV2"],
	/** The cost of the merchandise line before line-level discounts. */
	subtotalAmount?:ValueTypes["MoneyV2"],
	/** The total cost of the merchandise line. */
	totalAmount?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one CartLine and a cursor during pagination.
 */
["CartLineEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CartLineEdge. */
	node?:ValueTypes["CartLine"],
		__typename?: boolean | `@${string}`
}>;
	/** The estimated cost of the merchandise line that the buyer will pay at checkout. */
["CartLineEstimatedCost"]: AliasType<{
	/** The amount of the merchandise line. */
	amount?:ValueTypes["MoneyV2"],
	/** The compare at amount of the merchandise line. */
	compareAtAmount?:ValueTypes["MoneyV2"],
	/** The estimated cost of the merchandise line before discounts. */
	subtotalAmount?:ValueTypes["MoneyV2"],
	/** The estimated total cost of the merchandise line. */
	totalAmount?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create a merchandise line on a cart. */
["CartLineInput"]: {
	/** An array of key-value pairs that contains additional information about the merchandise line. */
	attributes?: Array<ValueTypes["AttributeInput"]> | undefined | null | Variable<any, string>,
	/** The quantity of the merchandise. */
	quantity?: number | undefined | null | Variable<any, string>,
	/** The ID of the merchandise that the buyer intends to purchase. */
	merchandiseId: string | Variable<any, string>,
	/** The ID of the selling plan that the merchandise is being purchased with. */
	sellingPlanId?: string | undefined | null | Variable<any, string>
};
	/** The input fields to update a line item on a cart. */
["CartLineUpdateInput"]: {
	/** The ID of the merchandise line. */
	id: string | Variable<any, string>,
	/** The quantity of the line item. */
	quantity?: number | undefined | null | Variable<any, string>,
	/** The ID of the merchandise for the line item. */
	merchandiseId?: string | undefined | null | Variable<any, string>,
	/** An array of key-value pairs that contains additional information about the merchandise line. */
	attributes?: Array<ValueTypes["AttributeInput"]> | undefined | null | Variable<any, string>,
	/** The ID of the selling plan that the merchandise is being purchased with. */
	sellingPlanId?: string | undefined | null | Variable<any, string>
};
	/** Return type for `cartLinesAdd` mutation. */
["CartLinesAddPayload"]: AliasType<{
	/** The updated cart. */
	cart?:ValueTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartLinesRemove` mutation. */
["CartLinesRemovePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ValueTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartLinesUpdate` mutation. */
["CartLinesUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ValueTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartNoteUpdate` mutation. */
["CartNoteUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ValueTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for updating the selected delivery options for a delivery group.
 */
["CartSelectedDeliveryOptionInput"]: {
	/** The ID of the cart delivery group. */
	deliveryGroupId: string | Variable<any, string>,
	/** The handle of the selected delivery option. */
	deliveryOptionHandle: string | Variable<any, string>
};
	/** Return type for `cartSelectedDeliveryOptionsUpdate` mutation. */
["CartSelectedDeliveryOptionsUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ValueTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error that happens during execution of a cart mutation. */
["CartUserError"]: AliasType<{
	/** The error code. */
	code?:boolean | `@${string}`,
	/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A container for all the information required to checkout items and pay. */
["Checkout"]: AliasType<{
	/** The gift cards used on the checkout. */
	appliedGiftCards?:ValueTypes["AppliedGiftCard"],
	/** The available shipping rates for this Checkout.
Should only be used when checkout `requiresShipping` is `true` and
the shipping address is valid.
 */
	availableShippingRates?:ValueTypes["AvailableShippingRates"],
	/** The identity of the customer associated with the checkout. */
	buyerIdentity?:ValueTypes["CheckoutBuyerIdentity"],
	/** The date and time when the checkout was completed. */
	completedAt?:boolean | `@${string}`,
	/** The date and time when the checkout was created. */
	createdAt?:boolean | `@${string}`,
	/** The currency code for the checkout. */
	currencyCode?:boolean | `@${string}`,
	/** A list of extra information that is added to the checkout. */
	customAttributes?:ValueTypes["Attribute"],
discountApplications?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["DiscountApplicationConnection"]],
	/** The email attached to this checkout. */
	email?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
lineItems?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["CheckoutLineItemConnection"]],
	/** The sum of all the prices of all the items in the checkout. Duties, taxes, shipping and discounts excluded. */
	lineItemsSubtotalPrice?:ValueTypes["MoneyV2"],
	/** The note associated with the checkout. */
	note?:boolean | `@${string}`,
	/** The resulting order from a paid checkout. */
	order?:ValueTypes["Order"],
	/** The Order Status Page for this Checkout, null when checkout is not completed. */
	orderStatusUrl?:boolean | `@${string}`,
	/** The amount left to be paid. This is equal to the cost of the line items, taxes, and shipping, minus discounts and gift cards. */
	paymentDue?:ValueTypes["MoneyV2"],
	/** The amount left to be paid. This is equal to the cost of the line items, duties, taxes, and shipping, minus discounts and gift cards. */
	paymentDueV2?:ValueTypes["MoneyV2"],
	/** Whether or not the Checkout is ready and can be completed. Checkouts may
have asynchronous operations that can take time to finish. If you want
to complete a checkout or ensure all the fields are populated and up to
date, polling is required until the value is true.
 */
	ready?:boolean | `@${string}`,
	/** States whether or not the fulfillment requires shipping. */
	requiresShipping?:boolean | `@${string}`,
	/** The shipping address to where the line items will be shipped. */
	shippingAddress?:ValueTypes["MailingAddress"],
	/** The discounts that have been allocated onto the shipping line by discount applications.
 */
	shippingDiscountAllocations?:ValueTypes["DiscountAllocation"],
	/** Once a shipping rate is selected by the customer it is transitioned to a `shipping_line` object. */
	shippingLine?:ValueTypes["ShippingRate"],
	/** The price at checkout before shipping and taxes. */
	subtotalPrice?:ValueTypes["MoneyV2"],
	/** The price at checkout before duties, shipping, and taxes. */
	subtotalPriceV2?:ValueTypes["MoneyV2"],
	/** Whether the checkout is tax exempt. */
	taxExempt?:boolean | `@${string}`,
	/** Whether taxes are included in the line item and shipping line prices. */
	taxesIncluded?:boolean | `@${string}`,
	/** The sum of all the duties applied to the line items in the checkout. */
	totalDuties?:ValueTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the checkout, including taxes and duties. */
	totalPrice?:ValueTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the checkout, including taxes and duties. */
	totalPriceV2?:ValueTypes["MoneyV2"],
	/** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
	totalTax?:ValueTypes["MoneyV2"],
	/** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
	totalTaxV2?:ValueTypes["MoneyV2"],
	/** The date and time when the checkout was last updated. */
	updatedAt?:boolean | `@${string}`,
	/** The url pointing to the checkout accessible from the web. */
	webUrl?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields required to update a checkout's attributes. */
["CheckoutAttributesUpdateV2Input"]: {
	/** The text of an optional note that a shop owner can attach to the checkout. */
	note?: string | undefined | null | Variable<any, string>,
	/** A list of extra information that is added to the checkout. */
	customAttributes?: Array<ValueTypes["AttributeInput"]> | undefined | null | Variable<any, string>,
	/** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
The required attributes are city, province, and country.
Full validation of the addresses is still done at completion time. Defaults to `false` with 
each operation.
 */
	allowPartialAddresses?: boolean | undefined | null | Variable<any, string>
};
	/** Return type for `checkoutAttributesUpdateV2` mutation. */
["CheckoutAttributesUpdateV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The identity of the customer associated with the checkout. */
["CheckoutBuyerIdentity"]: AliasType<{
	/** The country code for the checkout. For example, `CA`. */
	countryCode?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for the identity of the customer associated with the checkout. */
["CheckoutBuyerIdentityInput"]: {
	/** The country code of one of the shop's
[enabled countries](https://help.shopify.com/en/manual/payments/shopify-payments/multi-currency/setup).
For example, `CA`. Including this field creates a checkout in the specified country's currency.
 */
	countryCode: ValueTypes["CountryCode"] | Variable<any, string>
};
	/** Return type for `checkoutCompleteFree` mutation. */
["CheckoutCompleteFreePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutCompleteWithCreditCardV2` mutation. */
["CheckoutCompleteWithCreditCardV2Payload"]: AliasType<{
	/** The checkout on which the payment was applied. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** A representation of the attempted payment. */
	payment?:ValueTypes["Payment"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutCompleteWithTokenizedPaymentV3` mutation. */
["CheckoutCompleteWithTokenizedPaymentV3Payload"]: AliasType<{
	/** The checkout on which the payment was applied. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** A representation of the attempted payment. */
	payment?:ValueTypes["Payment"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields required to create a checkout. */
["CheckoutCreateInput"]: {
	/** The email with which the customer wants to checkout. */
	email?: string | undefined | null | Variable<any, string>,
	/** A list of line item objects, each one containing information about an item in the checkout. */
	lineItems?: Array<ValueTypes["CheckoutLineItemInput"]> | undefined | null | Variable<any, string>,
	/** The shipping address to where the line items will be shipped. */
	shippingAddress?: ValueTypes["MailingAddressInput"] | undefined | null | Variable<any, string>,
	/** The text of an optional note that a shop owner can attach to the checkout. */
	note?: string | undefined | null | Variable<any, string>,
	/** A list of extra information that is added to the checkout. */
	customAttributes?: Array<ValueTypes["AttributeInput"]> | undefined | null | Variable<any, string>,
	/** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
The required attributes are city, province, and country.
Full validation of addresses is still done at completion time. Defaults to `null`.
 */
	allowPartialAddresses?: boolean | undefined | null | Variable<any, string>,
	/** The identity of the customer associated with the checkout. */
	buyerIdentity?: ValueTypes["CheckoutBuyerIdentityInput"] | undefined | null | Variable<any, string>
};
	/** Return type for `checkoutCreate` mutation. */
["CheckoutCreatePayload"]: AliasType<{
	/** The new checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The checkout queue token. Available only to selected stores. */
	queueToken?:boolean | `@${string}`,
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutCustomerAssociateV2` mutation. */
["CheckoutCustomerAssociateV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The associated customer object. */
	customer?:ValueTypes["Customer"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutCustomerDisassociateV2` mutation. */
["CheckoutCustomerDisassociateV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutDiscountCodeApplyV2` mutation. */
["CheckoutDiscountCodeApplyV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutDiscountCodeRemove` mutation. */
["CheckoutDiscountCodeRemovePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutEmailUpdateV2` mutation. */
["CheckoutEmailUpdateV2Payload"]: AliasType<{
	/** The checkout object with the updated email. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Possible error codes that can be returned by `CheckoutUserError`. */
["CheckoutErrorCode"]:CheckoutErrorCode;
	/** Return type for `checkoutGiftCardRemoveV2` mutation. */
["CheckoutGiftCardRemoveV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutGiftCardsAppend` mutation. */
["CheckoutGiftCardsAppendPayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** A single line item in the checkout, grouped by variant and attributes. */
["CheckoutLineItem"]: AliasType<{
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?:ValueTypes["Attribute"],
	/** The discounts that have been allocated onto the checkout line item by discount applications. */
	discountAllocations?:ValueTypes["DiscountAllocation"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The quantity of the line item. */
	quantity?:boolean | `@${string}`,
	/** Title of the line item. Defaults to the product's title. */
	title?:boolean | `@${string}`,
	/** Unit price of the line item. */
	unitPrice?:ValueTypes["MoneyV2"],
	/** Product variant of the line item. */
	variant?:ValueTypes["ProductVariant"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple CheckoutLineItems.
 */
["CheckoutLineItemConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["CheckoutLineItemEdge"],
	/** A list of the nodes contained in CheckoutLineItemEdge. */
	nodes?:ValueTypes["CheckoutLineItem"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one CheckoutLineItem and a cursor during pagination.
 */
["CheckoutLineItemEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CheckoutLineItemEdge. */
	node?:ValueTypes["CheckoutLineItem"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create a line item on a checkout. */
["CheckoutLineItemInput"]: {
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?: Array<ValueTypes["AttributeInput"]> | undefined | null | Variable<any, string>,
	/** The quantity of the line item. */
	quantity: number | Variable<any, string>,
	/** The ID of the product variant for the line item. */
	variantId: string | Variable<any, string>
};
	/** The input fields to update a line item on the checkout. */
["CheckoutLineItemUpdateInput"]: {
	/** The ID of the line item. */
	id?: string | undefined | null | Variable<any, string>,
	/** The variant ID of the line item. */
	variantId?: string | undefined | null | Variable<any, string>,
	/** The quantity of the line item. */
	quantity?: number | undefined | null | Variable<any, string>,
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?: Array<ValueTypes["AttributeInput"]> | undefined | null | Variable<any, string>
};
	/** Return type for `checkoutLineItemsAdd` mutation. */
["CheckoutLineItemsAddPayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutLineItemsRemove` mutation. */
["CheckoutLineItemsRemovePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutLineItemsReplace` mutation. */
["CheckoutLineItemsReplacePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["CheckoutUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutLineItemsUpdate` mutation. */
["CheckoutLineItemsUpdatePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutShippingAddressUpdateV2` mutation. */
["CheckoutShippingAddressUpdateV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutShippingLineUpdate` mutation. */
["CheckoutShippingLineUpdatePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ValueTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ValueTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error that happens during execution of a checkout mutation. */
["CheckoutUserError"]: AliasType<{
	/** The error code. */
	code?:boolean | `@${string}`,
	/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A collection represents a grouping of products that a shop owner can create to organize them or make their shops easier to browse. */
["Collection"]: AliasType<{
description?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null | Variable<any, string>},boolean | `@${string}`],
	/** The description of the collection, complete with HTML formatting. */
	descriptionHtml?:boolean | `@${string}`,
	/** A human-friendly unique string for the collection automatically generated from its title.
Limit of 255 characters.
 */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** Image associated with the collection. */
	image?:ValueTypes["Image"],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
products?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["ProductCollectionSortKeys"] | undefined | null | Variable<any, string>,	/** Returns a subset of products matching all product filters. */
	filters?: Array<ValueTypes["ProductFilter"]> | undefined | null | Variable<any, string>},ValueTypes["ProductConnection"]],
	/** The collection's SEO information. */
	seo?:ValueTypes["SEO"],
	/** The collection’s name. Limit of 255 characters. */
	title?:boolean | `@${string}`,
	/** The date and time when the collection was last modified. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Collections.
 */
["CollectionConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["CollectionEdge"],
	/** A list of the nodes contained in CollectionEdge. */
	nodes?:ValueTypes["Collection"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Collection and a cursor during pagination.
 */
["CollectionEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CollectionEdge. */
	node?:ValueTypes["Collection"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Collection query. */
["CollectionSortKeys"]:CollectionSortKeys;
	/** A string containing a hexadecimal representation of a color.

For example, "#6A8D48".
 */
["Color"]:unknown;
	/** A comment on an article. */
["Comment"]: AliasType<{
	/** The comment’s author. */
	author?:ValueTypes["CommentAuthor"],
content?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null | Variable<any, string>},boolean | `@${string}`],
	/** The content of the comment, complete with HTML formatting. */
	contentHtml?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The author of a comment. */
["CommentAuthor"]: AliasType<{
	/** The author's email. */
	email?:boolean | `@${string}`,
	/** The author’s name. */
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Comments.
 */
["CommentConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["CommentEdge"],
	/** A list of the nodes contained in CommentEdge. */
	nodes?:ValueTypes["Comment"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Comment and a cursor during pagination.
 */
["CommentEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CommentEdge. */
	node?:ValueTypes["Comment"],
		__typename?: boolean | `@${string}`
}>;
	/** A country. */
["Country"]: AliasType<{
	/** The languages available for the country. */
	availableLanguages?:ValueTypes["Language"],
	/** The currency of the country. */
	currency?:ValueTypes["Currency"],
	/** The ISO code of the country. */
	isoCode?:boolean | `@${string}`,
	/** The name of the country. */
	name?:boolean | `@${string}`,
	/** The unit system used in the country. */
	unitSystem?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The code designating a country/region, which generally follows ISO 3166-1 alpha-2 guidelines.
If a territory doesn't have a country code value in the `CountryCode` enum, then it might be considered a subdivision
of another country. For example, the territories associated with Spain are represented by the country code `ES`,
and the territories associated with the United States of America are represented by the country code `US`.
 */
["CountryCode"]:CountryCode;
	/** Credit card information used for a payment. */
["CreditCard"]: AliasType<{
	/** The brand of the credit card. */
	brand?:boolean | `@${string}`,
	/** The expiry month of the credit card. */
	expiryMonth?:boolean | `@${string}`,
	/** The expiry year of the credit card. */
	expiryYear?:boolean | `@${string}`,
	/** The credit card's BIN number. */
	firstDigits?:boolean | `@${string}`,
	/** The first name of the card holder. */
	firstName?:boolean | `@${string}`,
	/** The last 4 digits of the credit card. */
	lastDigits?:boolean | `@${string}`,
	/** The last name of the card holder. */
	lastName?:boolean | `@${string}`,
	/** The masked credit card number with only the last 4 digits displayed. */
	maskedNumber?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Specifies the fields required to complete a checkout with
a Shopify vaulted credit card payment.
 */
["CreditCardPaymentInputV2"]: {
	/** The amount and currency of the payment. */
	paymentAmount: ValueTypes["MoneyInput"] | Variable<any, string>,
	/** A unique client generated key used to avoid duplicate charges. When a duplicate payment is found, the original is returned instead of creating a new one. For more information, refer to [Idempotent requests](https://shopify.dev/api/usage/idempotent-requests). */
	idempotencyKey: string | Variable<any, string>,
	/** The billing address for the payment. */
	billingAddress: ValueTypes["MailingAddressInput"] | Variable<any, string>,
	/** The ID returned by Shopify's Card Vault. */
	vaultId: string | Variable<any, string>,
	/** Executes the payment in test mode if possible. Defaults to `false`. */
	test?: boolean | undefined | null | Variable<any, string>
};
	/** The part of the image that should remain after cropping. */
["CropRegion"]:CropRegion;
	/** A currency. */
["Currency"]: AliasType<{
	/** The ISO code of the currency. */
	isoCode?:boolean | `@${string}`,
	/** The name of the currency. */
	name?:boolean | `@${string}`,
	/** The symbol of the currency. */
	symbol?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The three-letter currency codes that represent the world currencies used in stores. These include standard ISO 4217 codes, legacy codes,
and non-standard codes.
 */
["CurrencyCode"]:CurrencyCode;
	/** A customer represents a customer account with the shop. Customer accounts store contact information for the customer, saving logged-in customers the trouble of having to provide it at every checkout. */
["Customer"]: AliasType<{
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?:boolean | `@${string}`,
addresses?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["MailingAddressConnection"]],
	/** The date and time when the customer was created. */
	createdAt?:boolean | `@${string}`,
	/** The customer’s default address. */
	defaultAddress?:ValueTypes["MailingAddress"],
	/** The customer’s name, email or phone number. */
	displayName?:boolean | `@${string}`,
	/** The customer’s email address. */
	email?:boolean | `@${string}`,
	/** The customer’s first name. */
	firstName?:boolean | `@${string}`,
	/** A unique ID for the customer. */
	id?:boolean | `@${string}`,
	/** The customer's most recently updated, incomplete checkout. */
	lastIncompleteCheckout?:ValueTypes["Checkout"],
	/** The customer’s last name. */
	lastName?:boolean | `@${string}`,
metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]],
	/** The number of orders that the customer has made at the store in their lifetime. */
	numberOfOrders?:boolean | `@${string}`,
orders?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["OrderSortKeys"] | undefined | null | Variable<any, string>,	/** Supported filter parameters:
 - `processed_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null | Variable<any, string>},ValueTypes["OrderConnection"]],
	/** The customer’s phone number. */
	phone?:boolean | `@${string}`,
	/** A comma separated list of tags that have been added to the customer.
Additional access scope required: unauthenticated_read_customer_tags.
 */
	tags?:boolean | `@${string}`,
	/** The date and time when the customer information was updated. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A CustomerAccessToken represents the unique token required to make modifications to the customer object. */
["CustomerAccessToken"]: AliasType<{
	/** The customer’s access token. */
	accessToken?:boolean | `@${string}`,
	/** The date and time when the customer access token expires. */
	expiresAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields required to create a customer access token. */
["CustomerAccessTokenCreateInput"]: {
	/** The email associated to the customer. */
	email: string | Variable<any, string>,
	/** The login password to be used by the customer. */
	password: string | Variable<any, string>
};
	/** Return type for `customerAccessTokenCreate` mutation. */
["CustomerAccessTokenCreatePayload"]: AliasType<{
	/** The newly created customer access token object. */
	customerAccessToken?:ValueTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAccessTokenCreateWithMultipass` mutation. */
["CustomerAccessTokenCreateWithMultipassPayload"]: AliasType<{
	/** An access token object associated with the customer. */
	customerAccessToken?:ValueTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAccessTokenDelete` mutation. */
["CustomerAccessTokenDeletePayload"]: AliasType<{
	/** The destroyed access token. */
	deletedAccessToken?:boolean | `@${string}`,
	/** ID of the destroyed customer access token. */
	deletedCustomerAccessTokenId?:boolean | `@${string}`,
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAccessTokenRenew` mutation. */
["CustomerAccessTokenRenewPayload"]: AliasType<{
	/** The renewed customer access token object. */
	customerAccessToken?:ValueTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerActivateByUrl` mutation. */
["CustomerActivateByUrlPayload"]: AliasType<{
	/** The customer that was activated. */
	customer?:ValueTypes["Customer"],
	/** A new customer access token for the customer. */
	customerAccessToken?:ValueTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to activate a customer. */
["CustomerActivateInput"]: {
	/** The activation token required to activate the customer. */
	activationToken: string | Variable<any, string>,
	/** New password that will be set during activation. */
	password: string | Variable<any, string>
};
	/** Return type for `customerActivate` mutation. */
["CustomerActivatePayload"]: AliasType<{
	/** The customer object. */
	customer?:ValueTypes["Customer"],
	/** A newly created customer access token object for the customer. */
	customerAccessToken?:ValueTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAddressCreate` mutation. */
["CustomerAddressCreatePayload"]: AliasType<{
	/** The new customer address object. */
	customerAddress?:ValueTypes["MailingAddress"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAddressDelete` mutation. */
["CustomerAddressDeletePayload"]: AliasType<{
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** ID of the deleted customer address. */
	deletedCustomerAddressId?:boolean | `@${string}`,
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAddressUpdate` mutation. */
["CustomerAddressUpdatePayload"]: AliasType<{
	/** The customer’s updated mailing address. */
	customerAddress?:ValueTypes["MailingAddress"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create a new customer. */
["CustomerCreateInput"]: {
	/** The customer’s first name. */
	firstName?: string | undefined | null | Variable<any, string>,
	/** The customer’s last name. */
	lastName?: string | undefined | null | Variable<any, string>,
	/** The customer’s email. */
	email: string | Variable<any, string>,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined | null | Variable<any, string>,
	/** The login password used by the customer. */
	password: string | Variable<any, string>,
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?: boolean | undefined | null | Variable<any, string>
};
	/** Return type for `customerCreate` mutation. */
["CustomerCreatePayload"]: AliasType<{
	/** The created customer object. */
	customer?:ValueTypes["Customer"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerDefaultAddressUpdate` mutation. */
["CustomerDefaultAddressUpdatePayload"]: AliasType<{
	/** The updated customer object. */
	customer?:ValueTypes["Customer"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Possible error codes that can be returned by `CustomerUserError`. */
["CustomerErrorCode"]:CustomerErrorCode;
	/** Return type for `customerRecover` mutation. */
["CustomerRecoverPayload"]: AliasType<{
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerResetByUrl` mutation. */
["CustomerResetByUrlPayload"]: AliasType<{
	/** The customer object which was reset. */
	customer?:ValueTypes["Customer"],
	/** A newly created customer access token object for the customer. */
	customerAccessToken?:ValueTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to reset a customer's password. */
["CustomerResetInput"]: {
	/** The reset token required to reset the customer’s password. */
	resetToken: string | Variable<any, string>,
	/** New password that will be set as part of the reset password process. */
	password: string | Variable<any, string>
};
	/** Return type for `customerReset` mutation. */
["CustomerResetPayload"]: AliasType<{
	/** The customer object which was reset. */
	customer?:ValueTypes["Customer"],
	/** A newly created customer access token object for the customer. */
	customerAccessToken?:ValueTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to update the Customer information. */
["CustomerUpdateInput"]: {
	/** The customer’s first name. */
	firstName?: string | undefined | null | Variable<any, string>,
	/** The customer’s last name. */
	lastName?: string | undefined | null | Variable<any, string>,
	/** The customer’s email. */
	email?: string | undefined | null | Variable<any, string>,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_. To remove the phone number, specify `null`.
 */
	phone?: string | undefined | null | Variable<any, string>,
	/** The login password used by the customer. */
	password?: string | undefined | null | Variable<any, string>,
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?: boolean | undefined | null | Variable<any, string>
};
	/** Return type for `customerUpdate` mutation. */
["CustomerUpdatePayload"]: AliasType<{
	/** The updated customer object. */
	customer?:ValueTypes["Customer"],
	/** The newly created customer access token. If the customer's password is updated, all previous access tokens
(including the one used to perform this mutation) become invalid, and a new token is generated.
 */
	customerAccessToken?:ValueTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ValueTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ValueTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error that happens during execution of a customer mutation. */
["CustomerUserError"]: AliasType<{
	/** The error code. */
	code?:boolean | `@${string}`,
	/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)-encoded date and time string.
For example, 3:50 pm on September 7, 2019 in the time zone of UTC (Coordinated Universal Time) is
represented as `"2019-09-07T15:50:00Z`".
 */
["DateTime"]:unknown;
	/** A signed decimal number, which supports arbitrary precision and is serialized as a string.

Example values: `"29.99"`, `"29.999"`.
 */
["Decimal"]:unknown;
	/** A delivery address of the buyer that is interacting with the cart. */
["DeliveryAddress"]: AliasType<{		["...on MailingAddress"] : ValueTypes["MailingAddress"]
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for delivery address preferences.
 */
["DeliveryAddressInput"]: {
	/** A delivery address preference of a buyer that is interacting with the cart. */
	deliveryAddress?: ValueTypes["MailingAddressInput"] | undefined | null | Variable<any, string>
};
	/** List of different delivery method types. */
["DeliveryMethodType"]:DeliveryMethodType;
	/** Digital wallet, such as Apple Pay, which can be used for accelerated checkouts. */
["DigitalWallet"]:DigitalWallet;
	/** An amount discounting the line that has been allocated by a discount.
 */
["DiscountAllocation"]: AliasType<{
	/** Amount of discount allocated. */
	allocatedAmount?:ValueTypes["MoneyV2"],
	/** The discount this allocated amount originated from. */
	discountApplication?:ValueTypes["DiscountApplication"],
		__typename?: boolean | `@${string}`
}>;
	/** Discount applications capture the intentions of a discount source at
the time of application.
 */
["DiscountApplication"]:AliasType<{
		/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ValueTypes["PricingValue"];
		['...on AutomaticDiscountApplication']?: Omit<ValueTypes["AutomaticDiscountApplication"],keyof ValueTypes["DiscountApplication"]>;
		['...on DiscountCodeApplication']?: Omit<ValueTypes["DiscountCodeApplication"],keyof ValueTypes["DiscountApplication"]>;
		['...on ManualDiscountApplication']?: Omit<ValueTypes["ManualDiscountApplication"],keyof ValueTypes["DiscountApplication"]>;
		['...on ScriptDiscountApplication']?: Omit<ValueTypes["ScriptDiscountApplication"],keyof ValueTypes["DiscountApplication"]>;
		__typename?: boolean | `@${string}`
}>;
	/** The method by which the discount's value is allocated onto its entitled lines. */
["DiscountApplicationAllocationMethod"]:DiscountApplicationAllocationMethod;
	/** An auto-generated type for paginating through multiple DiscountApplications.
 */
["DiscountApplicationConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["DiscountApplicationEdge"],
	/** A list of the nodes contained in DiscountApplicationEdge. */
	nodes?:ValueTypes["DiscountApplication"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one DiscountApplication and a cursor during pagination.
 */
["DiscountApplicationEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of DiscountApplicationEdge. */
	node?:ValueTypes["DiscountApplication"],
		__typename?: boolean | `@${string}`
}>;
	/** The lines on the order to which the discount is applied, of the type defined by
the discount application's `targetType`. For example, the value `ENTITLED`, combined with a `targetType` of
`LINE_ITEM`, applies the discount on all line items that are entitled to the discount.
The value `ALL`, combined with a `targetType` of `SHIPPING_LINE`, applies the discount on all shipping lines.
 */
["DiscountApplicationTargetSelection"]:DiscountApplicationTargetSelection;
	/** The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards.
 */
["DiscountApplicationTargetType"]:DiscountApplicationTargetType;
	/** Discount code applications capture the intentions of a discount code at
the time that it is applied.
 */
["DiscountCodeApplication"]: AliasType<{
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** Specifies whether the discount code was applied successfully. */
	applicable?:boolean | `@${string}`,
	/** The string identifying the discount code that was used at the time of application. */
	code?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ValueTypes["PricingValue"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error in the input of a mutation. */
["DisplayableError"]:AliasType<{
		/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`;
		['...on CartUserError']?: Omit<ValueTypes["CartUserError"],keyof ValueTypes["DisplayableError"]>;
		['...on CheckoutUserError']?: Omit<ValueTypes["CheckoutUserError"],keyof ValueTypes["DisplayableError"]>;
		['...on CustomerUserError']?: Omit<ValueTypes["CustomerUserError"],keyof ValueTypes["DisplayableError"]>;
		['...on UserError']?: Omit<ValueTypes["UserError"],keyof ValueTypes["DisplayableError"]>;
		__typename?: boolean | `@${string}`
}>;
	/** Represents a web address. */
["Domain"]: AliasType<{
	/** The host name of the domain (eg: `example.com`). */
	host?:boolean | `@${string}`,
	/** Whether SSL is enabled or not. */
	sslEnabled?:boolean | `@${string}`,
	/** The URL of the domain (eg: `https://example.com`). */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents a video hosted outside of Shopify. */
["ExternalVideo"]: AliasType<{
	/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** The embed URL of the video for the respective host. */
	embedUrl?:boolean | `@${string}`,
	/** The URL. */
	embeddedUrl?:boolean | `@${string}`,
	/** The host of the external video. */
	host?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The origin URL of the video on the respective host. */
	originUrl?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ValueTypes["Image"],
		__typename?: boolean | `@${string}`
}>;
	/** A filter that is supported on the parent field. */
["Filter"]: AliasType<{
	/** A unique identifier. */
	id?:boolean | `@${string}`,
	/** A human-friendly string for this filter. */
	label?:boolean | `@${string}`,
	/** An enumeration that denotes the type of data this filter represents. */
	type?:boolean | `@${string}`,
	/** The list of values for this filter. */
	values?:ValueTypes["FilterValue"],
		__typename?: boolean | `@${string}`
}>;
	/** The type of data that the filter group represents.

For more information, refer to [Filter products in a collection with the Storefront API]
(https://shopify.dev/custom-storefronts/products-collections/filter-products).
 */
["FilterType"]:FilterType;
	/** A selectable value within a filter. */
["FilterValue"]: AliasType<{
	/** The number of results that match this filter value. */
	count?:boolean | `@${string}`,
	/** A unique identifier. */
	id?:boolean | `@${string}`,
	/** An input object that can be used to filter by this value on the parent field.

The value is provided as a helper for building dynamic filtering UI. For example, if you have a list of selected `FilterValue` objects, you can combine their respective `input` values to use in a subsequent query.
 */
	input?:boolean | `@${string}`,
	/** A human-friendly string for this filter value. */
	label?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents a single fulfillment in an order. */
["Fulfillment"]: AliasType<{
fulfillmentLineItems?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["FulfillmentLineItemConnection"]],
	/** The name of the tracking company. */
	trackingCompany?:boolean | `@${string}`,
trackingInfo?: [{	/** Truncate the array result to this size. */
	first?: number | undefined | null | Variable<any, string>},ValueTypes["FulfillmentTrackingInfo"]],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a single line item in a fulfillment. There is at most one fulfillment line item for each order line item. */
["FulfillmentLineItem"]: AliasType<{
	/** The associated order's line item. */
	lineItem?:ValueTypes["OrderLineItem"],
	/** The amount fulfilled in this fulfillment. */
	quantity?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple FulfillmentLineItems.
 */
["FulfillmentLineItemConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["FulfillmentLineItemEdge"],
	/** A list of the nodes contained in FulfillmentLineItemEdge. */
	nodes?:ValueTypes["FulfillmentLineItem"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one FulfillmentLineItem and a cursor during pagination.
 */
["FulfillmentLineItemEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of FulfillmentLineItemEdge. */
	node?:ValueTypes["FulfillmentLineItem"],
		__typename?: boolean | `@${string}`
}>;
	/** Tracking information associated with the fulfillment. */
["FulfillmentTrackingInfo"]: AliasType<{
	/** The tracking number of the fulfillment. */
	number?:boolean | `@${string}`,
	/** The URL to track the fulfillment. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The generic file resource lets you manage files in a merchant’s store. Generic files include any file that doesn’t fit into a designated type such as image or video. Example: PDF, JSON. */
["GenericFile"]: AliasType<{
	/** A word or phrase to indicate the contents of a file. */
	alt?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The MIME type of the file. */
	mimeType?:boolean | `@${string}`,
	/** The size of the original file in bytes. */
	originalFileSize?:boolean | `@${string}`,
	/** The preview image for the file. */
	previewImage?:ValueTypes["Image"],
	/** The URL of the file. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields used to specify a geographical location. */
["GeoCoordinateInput"]: {
	/** The coordinate's latitude value. */
	latitude: number | Variable<any, string>,
	/** The coordinate's longitude value. */
	longitude: number | Variable<any, string>
};
	/** A string containing HTML code. Refer to the [HTML spec](https://html.spec.whatwg.org/#elements-3) for a
complete list of HTML elements.

Example value: `"<p>Grey cotton knit sweater.</p>"`
 */
["HTML"]:unknown;
	/** Represents information about the metafields associated to the specified resource. */
["HasMetafields"]:AliasType<{
	metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]];
		['...on Article']?: Omit<ValueTypes["Article"],keyof ValueTypes["HasMetafields"]>;
		['...on Blog']?: Omit<ValueTypes["Blog"],keyof ValueTypes["HasMetafields"]>;
		['...on Collection']?: Omit<ValueTypes["Collection"],keyof ValueTypes["HasMetafields"]>;
		['...on Customer']?: Omit<ValueTypes["Customer"],keyof ValueTypes["HasMetafields"]>;
		['...on Order']?: Omit<ValueTypes["Order"],keyof ValueTypes["HasMetafields"]>;
		['...on Page']?: Omit<ValueTypes["Page"],keyof ValueTypes["HasMetafields"]>;
		['...on Product']?: Omit<ValueTypes["Product"],keyof ValueTypes["HasMetafields"]>;
		['...on ProductVariant']?: Omit<ValueTypes["ProductVariant"],keyof ValueTypes["HasMetafields"]>;
		['...on Shop']?: Omit<ValueTypes["Shop"],keyof ValueTypes["HasMetafields"]>;
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to identify a metafield on an owner resource by namespace and key. */
["HasMetafieldsIdentifier"]: {
	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,
	/** The identifier for the metafield. */
	key: string | Variable<any, string>
};
	/** Represents an image resource. */
["Image"]: AliasType<{
	/** A word or phrase to share the nature or contents of an image. */
	altText?:boolean | `@${string}`,
	/** The original height of the image in pixels. Returns `null` if the image is not hosted by Shopify. */
	height?:boolean | `@${string}`,
	/** A unique ID for the image. */
	id?:boolean | `@${string}`,
	/** The location of the original image as a URL.

If there are any existing transformations in the original source URL, they will remain and not be stripped.
 */
	originalSrc?:boolean | `@${string}`,
	/** The location of the image as a URL. */
	src?:boolean | `@${string}`,
transformedSrc?: [{	/** Image width in pixels between 1 and 5760. */
	maxWidth?: number | undefined | null | Variable<any, string>,	/** Image height in pixels between 1 and 5760. */
	maxHeight?: number | undefined | null | Variable<any, string>,	/** Crops the image according to the specified region. */
	crop?: ValueTypes["CropRegion"] | undefined | null | Variable<any, string>,	/** Image size multiplier for high-resolution retina displays. Must be between 1 and 3. */
	scale?: number | undefined | null | Variable<any, string>,	/** Best effort conversion of image into content type (SVG -> PNG, Anything -> JPG, Anything -> WEBP are supported). */
	preferredContentType?: ValueTypes["ImageContentType"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
url?: [{	/** A set of options to transform the original image. */
	transform?: ValueTypes["ImageTransformInput"] | undefined | null | Variable<any, string>},boolean | `@${string}`],
	/** The original width of the image in pixels. Returns `null` if the image is not hosted by Shopify. */
	width?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Images.
 */
["ImageConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["ImageEdge"],
	/** A list of the nodes contained in ImageEdge. */
	nodes?:ValueTypes["Image"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** List of supported image content types. */
["ImageContentType"]:ImageContentType;
	/** An auto-generated type which holds one Image and a cursor during pagination.
 */
["ImageEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of ImageEdge. */
	node?:ValueTypes["Image"],
		__typename?: boolean | `@${string}`
}>;
	/** The available options for transforming an image.

All transformation options are considered best effort. Any transformation that the original image type doesn't support will be ignored.
 */
["ImageTransformInput"]: {
	/** The region of the image to remain after cropping.
Must be used in conjunction with the `maxWidth` and/or `maxHeight` fields, where the `maxWidth` and `maxHeight` aren't equal.
The `crop` argument should coincide with the smaller value. A smaller `maxWidth` indicates a `LEFT` or `RIGHT` crop, while
a smaller `maxHeight` indicates a `TOP` or `BOTTOM` crop. For example, `{ maxWidth: 5, maxHeight: 10, crop: LEFT }` will result
in an image with a width of 5 and height of 10, where the right side of the image is removed.
 */
	crop?: ValueTypes["CropRegion"] | undefined | null | Variable<any, string>,
	/** Image width in pixels between 1 and 5760.
 */
	maxWidth?: number | undefined | null | Variable<any, string>,
	/** Image height in pixels between 1 and 5760.
 */
	maxHeight?: number | undefined | null | Variable<any, string>,
	/** Image size multiplier for high-resolution retina displays. Must be within 1..3.
 */
	scale?: number | undefined | null | Variable<any, string>,
	/** Convert the source image into the preferred content type.
Supported conversions: `.svg` to `.png`, any file type to `.jpg`, and any file type to `.webp`.
 */
	preferredContentType?: ValueTypes["ImageContentType"] | undefined | null | Variable<any, string>
};
	/** A [JSON](https://www.json.org/json-en.html) object.

Example value:
`{
  "product": {
    "id": "gid://shopify/Product/1346443542550",
    "title": "White T-shirt",
    "options": [{
      "name": "Size",
      "values": ["M", "L"]
    }]
  }
}`
 */
["JSON"]:unknown;
	/** A language. */
["Language"]: AliasType<{
	/** The name of the language in the language itself. If the language uses capitalization, it is capitalized for a mid-sentence position. */
	endonymName?:boolean | `@${string}`,
	/** The ISO code. */
	isoCode?:boolean | `@${string}`,
	/** The name of the language in the current language. */
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** ISO 639-1 language codes supported by Shopify. */
["LanguageCode"]:LanguageCode;
	/** Information about the localized experiences configured for the shop. */
["Localization"]: AliasType<{
	/** The list of countries with enabled localized experiences. */
	availableCountries?:ValueTypes["Country"],
	/** The list of languages available for the active country. */
	availableLanguages?:ValueTypes["Language"],
	/** The country of the active localized experience. Use the `@inContext` directive to change this value. */
	country?:ValueTypes["Country"],
	/** The language of the active localized experience. Use the `@inContext` directive to change this value. */
	language?:ValueTypes["Language"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a location where product inventory is held. */
["Location"]: AliasType<{
	/** The address of the location. */
	address?:ValueTypes["LocationAddress"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The name of the location. */
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents the address of a location.
 */
["LocationAddress"]: AliasType<{
	/** The first line of the address for the location. */
	address1?:boolean | `@${string}`,
	/** The second line of the address for the location. */
	address2?:boolean | `@${string}`,
	/** The city of the location. */
	city?:boolean | `@${string}`,
	/** The country of the location. */
	country?:boolean | `@${string}`,
	/** The country code of the location. */
	countryCode?:boolean | `@${string}`,
	/** A formatted version of the address for the location. */
	formatted?:boolean | `@${string}`,
	/** The latitude coordinates of the location. */
	latitude?:boolean | `@${string}`,
	/** The longitude coordinates of the location. */
	longitude?:boolean | `@${string}`,
	/** The phone number of the location. */
	phone?:boolean | `@${string}`,
	/** The province of the location. */
	province?:boolean | `@${string}`,
	/** The code for the province, state, or district of the address of the location.
 */
	provinceCode?:boolean | `@${string}`,
	/** The ZIP code of the location. */
	zip?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Locations.
 */
["LocationConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["LocationEdge"],
	/** A list of the nodes contained in LocationEdge. */
	nodes?:ValueTypes["Location"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Location and a cursor during pagination.
 */
["LocationEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of LocationEdge. */
	node?:ValueTypes["Location"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Location query. */
["LocationSortKeys"]:LocationSortKeys;
	/** Represents a mailing address for customers and shipping. */
["MailingAddress"]: AliasType<{
	/** The first line of the address. Typically the street address or PO Box number. */
	address1?:boolean | `@${string}`,
	/** The second line of the address. Typically the number of the apartment, suite, or unit.
 */
	address2?:boolean | `@${string}`,
	/** The name of the city, district, village, or town.
 */
	city?:boolean | `@${string}`,
	/** The name of the customer's company or organization.
 */
	company?:boolean | `@${string}`,
	/** The name of the country.
 */
	country?:boolean | `@${string}`,
	/** The two-letter code for the country of the address.

For example, US.
 */
	countryCode?:boolean | `@${string}`,
	/** The two-letter code for the country of the address.

For example, US.
 */
	countryCodeV2?:boolean | `@${string}`,
	/** The first name of the customer. */
	firstName?:boolean | `@${string}`,
formatted?: [{	/** Whether to include the customer's name in the formatted address. */
	withName?: boolean | undefined | null | Variable<any, string>,	/** Whether to include the customer's company in the formatted address. */
	withCompany?: boolean | undefined | null | Variable<any, string>},boolean | `@${string}`],
	/** A comma-separated list of the values for city, province, and country. */
	formattedArea?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The last name of the customer. */
	lastName?:boolean | `@${string}`,
	/** The latitude coordinate of the customer address. */
	latitude?:boolean | `@${string}`,
	/** The longitude coordinate of the customer address. */
	longitude?:boolean | `@${string}`,
	/** The full name of the customer, based on firstName and lastName.
 */
	name?:boolean | `@${string}`,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?:boolean | `@${string}`,
	/** The region of the address, such as the province, state, or district. */
	province?:boolean | `@${string}`,
	/** The two-letter code for the region.

For example, ON.
 */
	provinceCode?:boolean | `@${string}`,
	/** The zip or postal code of the address. */
	zip?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple MailingAddresses.
 */
["MailingAddressConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["MailingAddressEdge"],
	/** A list of the nodes contained in MailingAddressEdge. */
	nodes?:ValueTypes["MailingAddress"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one MailingAddress and a cursor during pagination.
 */
["MailingAddressEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of MailingAddressEdge. */
	node?:ValueTypes["MailingAddress"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create or update a mailing address. */
["MailingAddressInput"]: {
	/** The first line of the address. Typically the street address or PO Box number.
 */
	address1?: string | undefined | null | Variable<any, string>,
	/** The second line of the address. Typically the number of the apartment, suite, or unit.
 */
	address2?: string | undefined | null | Variable<any, string>,
	/** The name of the city, district, village, or town.
 */
	city?: string | undefined | null | Variable<any, string>,
	/** The name of the customer's company or organization.
 */
	company?: string | undefined | null | Variable<any, string>,
	/** The name of the country. */
	country?: string | undefined | null | Variable<any, string>,
	/** The first name of the customer. */
	firstName?: string | undefined | null | Variable<any, string>,
	/** The last name of the customer. */
	lastName?: string | undefined | null | Variable<any, string>,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined | null | Variable<any, string>,
	/** The region of the address, such as the province, state, or district. */
	province?: string | undefined | null | Variable<any, string>,
	/** The zip or postal code of the address. */
	zip?: string | undefined | null | Variable<any, string>
};
	/** Manual discount applications capture the intentions of a discount that was manually created.
 */
["ManualDiscountApplication"]: AliasType<{
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** The description of the application. */
	description?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The title of the application. */
	title?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ValueTypes["PricingValue"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a media interface. */
["Media"]:AliasType<{
		/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ValueTypes["Image"];
		['...on ExternalVideo']?: Omit<ValueTypes["ExternalVideo"],keyof ValueTypes["Media"]>;
		['...on MediaImage']?: Omit<ValueTypes["MediaImage"],keyof ValueTypes["Media"]>;
		['...on Model3d']?: Omit<ValueTypes["Model3d"],keyof ValueTypes["Media"]>;
		['...on Video']?: Omit<ValueTypes["Video"],keyof ValueTypes["Media"]>;
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Media.
 */
["MediaConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["MediaEdge"],
	/** A list of the nodes contained in MediaEdge. */
	nodes?:ValueTypes["Media"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** The possible content types for a media object. */
["MediaContentType"]:MediaContentType;
	/** An auto-generated type which holds one Media and a cursor during pagination.
 */
["MediaEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of MediaEdge. */
	node?:ValueTypes["Media"],
		__typename?: boolean | `@${string}`
}>;
	/** Host for a Media Resource. */
["MediaHost"]:MediaHost;
	/** Represents a Shopify hosted image. */
["MediaImage"]: AliasType<{
	/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The image for the media. */
	image?:ValueTypes["Image"],
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ValueTypes["Image"],
		__typename?: boolean | `@${string}`
}>;
	/** A [navigation menu](https://help.shopify.com/manual/online-store/menus-and-links) representing a hierarchy
of hyperlinks (items).
 */
["Menu"]: AliasType<{
	/** The menu's handle. */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The menu's child items. */
	items?:ValueTypes["MenuItem"],
	/** The count of items on the menu. */
	itemsCount?:boolean | `@${string}`,
	/** The menu's title. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A menu item within a parent menu.
 */
["MenuItem"]: AliasType<{
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The menu item's child items. */
	items?:ValueTypes["MenuItem"],
	/** The ID of the linked resource. */
	resourceId?:boolean | `@${string}`,
	/** The menu item's tags to filter a collection. */
	tags?:boolean | `@${string}`,
	/** The menu item's title. */
	title?:boolean | `@${string}`,
	/** The menu item's type. */
	type?:boolean | `@${string}`,
	/** The menu item's URL. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A menu item type. */
["MenuItemType"]:MenuItemType;
	/** The merchandise to be purchased at checkout. */
["Merchandise"]: AliasType<{		["...on ProductVariant"] : ValueTypes["ProductVariant"]
		__typename?: boolean | `@${string}`
}>;
	/** Metafields represent custom metadata attached to a resource. Metafields can be sorted into namespaces and are
comprised of keys, values, and value types.
 */
["Metafield"]: AliasType<{
	/** The date and time when the storefront metafield was created. */
	createdAt?:boolean | `@${string}`,
	/** The description of a metafield. */
	description?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The unique identifier for the metafield within its namespace. */
	key?:boolean | `@${string}`,
	/** The container for a group of metafields that the metafield is associated with. */
	namespace?:boolean | `@${string}`,
	/** The type of resource that the metafield is attached to. */
	parentResource?:ValueTypes["MetafieldParentResource"],
	/** Returns a reference object if the metafield's type is a resource reference. */
	reference?:ValueTypes["MetafieldReference"],
references?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>},ValueTypes["MetafieldReferenceConnection"]],
	/** The type name of the metafield.
Refer to the list of [supported types](https://shopify.dev/apps/metafields/definitions/types).
 */
	type?:boolean | `@${string}`,
	/** The date and time when the metafield was last updated. */
	updatedAt?:boolean | `@${string}`,
	/** The data stored in the metafield. Always stored as a string, regardless of the metafield's type. */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A filter used to view a subset of products in a collection matching a specific metafield value.

Only the following metafield types are currently supported:
- `number_integer`
- `number_decimal`
- `single_line_text_field`
- `boolean` as of 2022-04.
 */
["MetafieldFilter"]: {
	/** The namespace of the metafield to filter on. */
	namespace: string | Variable<any, string>,
	/** The key of the metafield to filter on. */
	key: string | Variable<any, string>,
	/** The value of the metafield. */
	value: string | Variable<any, string>
};
	/** A resource that the metafield belongs to. */
["MetafieldParentResource"]: AliasType<{		["...on Article"] : ValueTypes["Article"],
		["...on Blog"] : ValueTypes["Blog"],
		["...on Collection"] : ValueTypes["Collection"],
		["...on Customer"] : ValueTypes["Customer"],
		["...on Order"] : ValueTypes["Order"],
		["...on Page"] : ValueTypes["Page"],
		["...on Product"] : ValueTypes["Product"],
		["...on ProductVariant"] : ValueTypes["ProductVariant"],
		["...on Shop"] : ValueTypes["Shop"]
		__typename?: boolean | `@${string}`
}>;
	/** Returns the resource which is being referred to by a metafield.
 */
["MetafieldReference"]: AliasType<{		["...on Collection"] : ValueTypes["Collection"],
		["...on GenericFile"] : ValueTypes["GenericFile"],
		["...on MediaImage"] : ValueTypes["MediaImage"],
		["...on Metaobject"] : ValueTypes["Metaobject"],
		["...on Page"] : ValueTypes["Page"],
		["...on Product"] : ValueTypes["Product"],
		["...on ProductVariant"] : ValueTypes["ProductVariant"],
		["...on Video"] : ValueTypes["Video"]
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple MetafieldReferences.
 */
["MetafieldReferenceConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["MetafieldReferenceEdge"],
	/** A list of the nodes contained in MetafieldReferenceEdge. */
	nodes?:ValueTypes["MetafieldReference"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one MetafieldReference and a cursor during pagination.
 */
["MetafieldReferenceEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of MetafieldReferenceEdge. */
	node?:ValueTypes["MetafieldReference"],
		__typename?: boolean | `@${string}`
}>;
	/** An instance of a user-defined model based on a MetaobjectDefinition. */
["Metaobject"]: AliasType<{
field?: [{	/** The key of the field. */
	key: string | Variable<any, string>},ValueTypes["MetaobjectField"]],
	/** All object fields with defined values.
Omitted object keys can be assumed null, and no guarantees are made about field order.
 */
	fields?:ValueTypes["MetaobjectField"],
	/** The unique handle of the metaobject. Useful as a custom ID. */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The type of the metaobject. Defines the namespace of its associated metafields. */
	type?:boolean | `@${string}`,
	/** The date and time when the metaobject was last updated. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Metaobjects.
 */
["MetaobjectConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["MetaobjectEdge"],
	/** A list of the nodes contained in MetaobjectEdge. */
	nodes?:ValueTypes["Metaobject"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Metaobject and a cursor during pagination.
 */
["MetaobjectEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of MetaobjectEdge. */
	node?:ValueTypes["Metaobject"],
		__typename?: boolean | `@${string}`
}>;
	/** Provides the value of a Metaobject field. */
["MetaobjectField"]: AliasType<{
	/** The field key. */
	key?:boolean | `@${string}`,
	/** A referenced object if the field type is a resource reference. */
	reference?:ValueTypes["MetafieldReference"],
references?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>},ValueTypes["MetafieldReferenceConnection"]],
	/** The type name of the field.
See the list of [supported types](https://shopify.dev/apps/metafields/definitions/types).
 */
	type?:boolean | `@${string}`,
	/** The field value. */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields used to retrieve a metaobject by handle. */
["MetaobjectHandleInput"]: {
	/** The handle of the metaobject. */
	handle: string | Variable<any, string>,
	/** The type of the metaobject. */
	type: string | Variable<any, string>
};
	/** Represents a Shopify hosted 3D model. */
["Model3d"]: AliasType<{
	/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ValueTypes["Image"],
	/** The sources for a 3d model. */
	sources?:ValueTypes["Model3dSource"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a source for a Shopify hosted 3d model. */
["Model3dSource"]: AliasType<{
	/** The filesize of the 3d model. */
	filesize?:boolean | `@${string}`,
	/** The format of the 3d model. */
	format?:boolean | `@${string}`,
	/** The MIME type of the 3d model. */
	mimeType?:boolean | `@${string}`,
	/** The URL of the 3d model. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for a monetary value with currency. */
["MoneyInput"]: {
	/** Decimal money amount. */
	amount: ValueTypes["Decimal"] | Variable<any, string>,
	/** Currency of the money. */
	currencyCode: ValueTypes["CurrencyCode"] | Variable<any, string>
};
	/** A monetary value with currency.
 */
["MoneyV2"]: AliasType<{
	/** Decimal money amount. */
	amount?:boolean | `@${string}`,
	/** Currency of the money. */
	currencyCode?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
["Mutation"]: AliasType<{
cartAttributesUpdate?: [{	/** An array of key-value pairs that contains additional information about the cart. */
	attributes: Array<ValueTypes["AttributeInput"]> | Variable<any, string>,	/** The ID of the cart. */
	cartId: string | Variable<any, string>},ValueTypes["CartAttributesUpdatePayload"]],
cartBuyerIdentityUpdate?: [{	/** The ID of the cart. */
	cartId: string | Variable<any, string>,	/** The customer associated with the cart. Used to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
Buyer identity should match the customer's shipping address.
 */
	buyerIdentity: ValueTypes["CartBuyerIdentityInput"] | Variable<any, string>},ValueTypes["CartBuyerIdentityUpdatePayload"]],
cartCreate?: [{	/** The fields used to create a cart. */
	input?: ValueTypes["CartInput"] | undefined | null | Variable<any, string>},ValueTypes["CartCreatePayload"]],
cartDiscountCodesUpdate?: [{	/** The ID of the cart. */
	cartId: string | Variable<any, string>,	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes?: Array<string> | undefined | null | Variable<any, string>},ValueTypes["CartDiscountCodesUpdatePayload"]],
cartLinesAdd?: [{	/** A list of merchandise lines to add to the cart. */
	lines: Array<ValueTypes["CartLineInput"]> | Variable<any, string>,	/** The ID of the cart. */
	cartId: string | Variable<any, string>},ValueTypes["CartLinesAddPayload"]],
cartLinesRemove?: [{	/** The ID of the cart. */
	cartId: string | Variable<any, string>,	/** The merchandise line IDs to remove. */
	lineIds: Array<string> | Variable<any, string>},ValueTypes["CartLinesRemovePayload"]],
cartLinesUpdate?: [{	/** The ID of the cart. */
	cartId: string | Variable<any, string>,	/** The merchandise lines to update. */
	lines: Array<ValueTypes["CartLineUpdateInput"]> | Variable<any, string>},ValueTypes["CartLinesUpdatePayload"]],
cartNoteUpdate?: [{	/** The ID of the cart. */
	cartId: string | Variable<any, string>,	/** The note on the cart. */
	note?: string | undefined | null | Variable<any, string>},ValueTypes["CartNoteUpdatePayload"]],
cartSelectedDeliveryOptionsUpdate?: [{	/** The ID of the cart. */
	cartId: string | Variable<any, string>,	/** The selected delivery options. */
	selectedDeliveryOptions: Array<ValueTypes["CartSelectedDeliveryOptionInput"]> | Variable<any, string>},ValueTypes["CartSelectedDeliveryOptionsUpdatePayload"]],
checkoutAttributesUpdateV2?: [{	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>,	/** The checkout attributes to update. */
	input: ValueTypes["CheckoutAttributesUpdateV2Input"] | Variable<any, string>},ValueTypes["CheckoutAttributesUpdateV2Payload"]],
checkoutCompleteFree?: [{	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>},ValueTypes["CheckoutCompleteFreePayload"]],
checkoutCompleteWithCreditCardV2?: [{	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>,	/** The credit card info to apply as a payment. */
	payment: ValueTypes["CreditCardPaymentInputV2"] | Variable<any, string>},ValueTypes["CheckoutCompleteWithCreditCardV2Payload"]],
checkoutCompleteWithTokenizedPaymentV3?: [{	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>,	/** The info to apply as a tokenized payment. */
	payment: ValueTypes["TokenizedPaymentInputV3"] | Variable<any, string>},ValueTypes["CheckoutCompleteWithTokenizedPaymentV3Payload"]],
checkoutCreate?: [{	/** The fields used to create a checkout. */
	input: ValueTypes["CheckoutCreateInput"] | Variable<any, string>,	/** The checkout queue token. Available only to selected stores. */
	queueToken?: string | undefined | null | Variable<any, string>},ValueTypes["CheckoutCreatePayload"]],
checkoutCustomerAssociateV2?: [{	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>,	/** The customer access token of the customer to associate. */
	customerAccessToken: string | Variable<any, string>},ValueTypes["CheckoutCustomerAssociateV2Payload"]],
checkoutCustomerDisassociateV2?: [{	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>},ValueTypes["CheckoutCustomerDisassociateV2Payload"]],
checkoutDiscountCodeApplyV2?: [{	/** The discount code to apply to the checkout. */
	discountCode: string | Variable<any, string>,	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>},ValueTypes["CheckoutDiscountCodeApplyV2Payload"]],
checkoutDiscountCodeRemove?: [{	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>},ValueTypes["CheckoutDiscountCodeRemovePayload"]],
checkoutEmailUpdateV2?: [{	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>,	/** The email to update the checkout with. */
	email: string | Variable<any, string>},ValueTypes["CheckoutEmailUpdateV2Payload"]],
checkoutGiftCardRemoveV2?: [{	/** The ID of the Applied Gift Card to remove from the Checkout. */
	appliedGiftCardId: string | Variable<any, string>,	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>},ValueTypes["CheckoutGiftCardRemoveV2Payload"]],
checkoutGiftCardsAppend?: [{	/** A list of gift card codes to append to the checkout. */
	giftCardCodes: Array<string> | Variable<any, string>,	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>},ValueTypes["CheckoutGiftCardsAppendPayload"]],
checkoutLineItemsAdd?: [{	/** A list of line item objects to add to the checkout. */
	lineItems: Array<ValueTypes["CheckoutLineItemInput"]> | Variable<any, string>,	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>},ValueTypes["CheckoutLineItemsAddPayload"]],
checkoutLineItemsRemove?: [{	/** The checkout on which to remove line items. */
	checkoutId: string | Variable<any, string>,	/** Line item ids to remove. */
	lineItemIds: Array<string> | Variable<any, string>},ValueTypes["CheckoutLineItemsRemovePayload"]],
checkoutLineItemsReplace?: [{	/** A list of line item objects to set on the checkout. */
	lineItems: Array<ValueTypes["CheckoutLineItemInput"]> | Variable<any, string>,	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>},ValueTypes["CheckoutLineItemsReplacePayload"]],
checkoutLineItemsUpdate?: [{	/** The checkout on which to update line items. */
	checkoutId: string | Variable<any, string>,	/** Line items to update. */
	lineItems: Array<ValueTypes["CheckoutLineItemUpdateInput"]> | Variable<any, string>},ValueTypes["CheckoutLineItemsUpdatePayload"]],
checkoutShippingAddressUpdateV2?: [{	/** The shipping address to where the line items will be shipped. */
	shippingAddress: ValueTypes["MailingAddressInput"] | Variable<any, string>,	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>},ValueTypes["CheckoutShippingAddressUpdateV2Payload"]],
checkoutShippingLineUpdate?: [{	/** The ID of the checkout. */
	checkoutId: string | Variable<any, string>,	/** A unique identifier to a Checkout’s shipping provider, price, and title combination, enabling the customer to select the availableShippingRates. */
	shippingRateHandle: string | Variable<any, string>},ValueTypes["CheckoutShippingLineUpdatePayload"]],
customerAccessTokenCreate?: [{	/** The fields used to create a customer access token. */
	input: ValueTypes["CustomerAccessTokenCreateInput"] | Variable<any, string>},ValueTypes["CustomerAccessTokenCreatePayload"]],
customerAccessTokenCreateWithMultipass?: [{	/** A valid [multipass token](https://shopify.dev/api/multipass) to be authenticated. */
	multipassToken: string | Variable<any, string>},ValueTypes["CustomerAccessTokenCreateWithMultipassPayload"]],
customerAccessTokenDelete?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string | Variable<any, string>},ValueTypes["CustomerAccessTokenDeletePayload"]],
customerAccessTokenRenew?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string | Variable<any, string>},ValueTypes["CustomerAccessTokenRenewPayload"]],
customerActivate?: [{	/** Specifies the customer to activate. */
	id: string | Variable<any, string>,	/** The fields used to activate a customer. */
	input: ValueTypes["CustomerActivateInput"] | Variable<any, string>},ValueTypes["CustomerActivatePayload"]],
customerActivateByUrl?: [{	/** The customer activation URL. */
	activationUrl: ValueTypes["URL"] | Variable<any, string>,	/** A new password set during activation. */
	password: string | Variable<any, string>},ValueTypes["CustomerActivateByUrlPayload"]],
customerAddressCreate?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string | Variable<any, string>,	/** The customer mailing address to create. */
	address: ValueTypes["MailingAddressInput"] | Variable<any, string>},ValueTypes["CustomerAddressCreatePayload"]],
customerAddressDelete?: [{	/** Specifies the address to delete. */
	id: string | Variable<any, string>,	/** The access token used to identify the customer. */
	customerAccessToken: string | Variable<any, string>},ValueTypes["CustomerAddressDeletePayload"]],
customerAddressUpdate?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string | Variable<any, string>,	/** Specifies the customer address to update. */
	id: string | Variable<any, string>,	/** The customer’s mailing address. */
	address: ValueTypes["MailingAddressInput"] | Variable<any, string>},ValueTypes["CustomerAddressUpdatePayload"]],
customerCreate?: [{	/** The fields used to create a new customer. */
	input: ValueTypes["CustomerCreateInput"] | Variable<any, string>},ValueTypes["CustomerCreatePayload"]],
customerDefaultAddressUpdate?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string | Variable<any, string>,	/** ID of the address to set as the new default for the customer. */
	addressId: string | Variable<any, string>},ValueTypes["CustomerDefaultAddressUpdatePayload"]],
customerRecover?: [{	/** The email address of the customer to recover. */
	email: string | Variable<any, string>},ValueTypes["CustomerRecoverPayload"]],
customerReset?: [{	/** Specifies the customer to reset. */
	id: string | Variable<any, string>,	/** The fields used to reset a customer’s password. */
	input: ValueTypes["CustomerResetInput"] | Variable<any, string>},ValueTypes["CustomerResetPayload"]],
customerResetByUrl?: [{	/** The customer's reset password url. */
	resetUrl: ValueTypes["URL"] | Variable<any, string>,	/** New password that will be set as part of the reset password process. */
	password: string | Variable<any, string>},ValueTypes["CustomerResetByUrlPayload"]],
customerUpdate?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string | Variable<any, string>,	/** The customer object input. */
	customer: ValueTypes["CustomerUpdateInput"] | Variable<any, string>},ValueTypes["CustomerUpdatePayload"]],
		__typename?: boolean | `@${string}`
}>;
	/** An object with an ID field to support global identification, in accordance with the
[Relay specification](https://relay.dev/graphql/objectidentification.htm#sec-Node-Interface).
This interface is used by the [node](https://shopify.dev/api/admin-graphql/unstable/queries/node)
and [nodes](https://shopify.dev/api/admin-graphql/unstable/queries/nodes) queries.
 */
["Node"]:AliasType<{
		/** A globally-unique ID. */
	id?:boolean | `@${string}`;
		['...on AppliedGiftCard']?: Omit<ValueTypes["AppliedGiftCard"],keyof ValueTypes["Node"]>;
		['...on Article']?: Omit<ValueTypes["Article"],keyof ValueTypes["Node"]>;
		['...on Blog']?: Omit<ValueTypes["Blog"],keyof ValueTypes["Node"]>;
		['...on Cart']?: Omit<ValueTypes["Cart"],keyof ValueTypes["Node"]>;
		['...on CartLine']?: Omit<ValueTypes["CartLine"],keyof ValueTypes["Node"]>;
		['...on Checkout']?: Omit<ValueTypes["Checkout"],keyof ValueTypes["Node"]>;
		['...on CheckoutLineItem']?: Omit<ValueTypes["CheckoutLineItem"],keyof ValueTypes["Node"]>;
		['...on Collection']?: Omit<ValueTypes["Collection"],keyof ValueTypes["Node"]>;
		['...on Comment']?: Omit<ValueTypes["Comment"],keyof ValueTypes["Node"]>;
		['...on ExternalVideo']?: Omit<ValueTypes["ExternalVideo"],keyof ValueTypes["Node"]>;
		['...on GenericFile']?: Omit<ValueTypes["GenericFile"],keyof ValueTypes["Node"]>;
		['...on Location']?: Omit<ValueTypes["Location"],keyof ValueTypes["Node"]>;
		['...on MailingAddress']?: Omit<ValueTypes["MailingAddress"],keyof ValueTypes["Node"]>;
		['...on MediaImage']?: Omit<ValueTypes["MediaImage"],keyof ValueTypes["Node"]>;
		['...on Menu']?: Omit<ValueTypes["Menu"],keyof ValueTypes["Node"]>;
		['...on MenuItem']?: Omit<ValueTypes["MenuItem"],keyof ValueTypes["Node"]>;
		['...on Metafield']?: Omit<ValueTypes["Metafield"],keyof ValueTypes["Node"]>;
		['...on Metaobject']?: Omit<ValueTypes["Metaobject"],keyof ValueTypes["Node"]>;
		['...on Model3d']?: Omit<ValueTypes["Model3d"],keyof ValueTypes["Node"]>;
		['...on Order']?: Omit<ValueTypes["Order"],keyof ValueTypes["Node"]>;
		['...on Page']?: Omit<ValueTypes["Page"],keyof ValueTypes["Node"]>;
		['...on Payment']?: Omit<ValueTypes["Payment"],keyof ValueTypes["Node"]>;
		['...on Product']?: Omit<ValueTypes["Product"],keyof ValueTypes["Node"]>;
		['...on ProductOption']?: Omit<ValueTypes["ProductOption"],keyof ValueTypes["Node"]>;
		['...on ProductVariant']?: Omit<ValueTypes["ProductVariant"],keyof ValueTypes["Node"]>;
		['...on Shop']?: Omit<ValueTypes["Shop"],keyof ValueTypes["Node"]>;
		['...on ShopPolicy']?: Omit<ValueTypes["ShopPolicy"],keyof ValueTypes["Node"]>;
		['...on UrlRedirect']?: Omit<ValueTypes["UrlRedirect"],keyof ValueTypes["Node"]>;
		['...on Video']?: Omit<ValueTypes["Video"],keyof ValueTypes["Node"]>;
		__typename?: boolean | `@${string}`
}>;
	/** Represents a resource that can be published to the Online Store sales channel. */
["OnlineStorePublishable"]:AliasType<{
		/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`;
		['...on Article']?: Omit<ValueTypes["Article"],keyof ValueTypes["OnlineStorePublishable"]>;
		['...on Blog']?: Omit<ValueTypes["Blog"],keyof ValueTypes["OnlineStorePublishable"]>;
		['...on Collection']?: Omit<ValueTypes["Collection"],keyof ValueTypes["OnlineStorePublishable"]>;
		['...on Page']?: Omit<ValueTypes["Page"],keyof ValueTypes["OnlineStorePublishable"]>;
		['...on Product']?: Omit<ValueTypes["Product"],keyof ValueTypes["OnlineStorePublishable"]>;
		__typename?: boolean | `@${string}`
}>;
	/** An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process, during which time they provides an email address, billing address and payment information. */
["Order"]: AliasType<{
	/** The reason for the order's cancellation. Returns `null` if the order wasn't canceled. */
	cancelReason?:boolean | `@${string}`,
	/** The date and time when the order was canceled. Returns null if the order wasn't canceled. */
	canceledAt?:boolean | `@${string}`,
	/** The code of the currency used for the payment. */
	currencyCode?:boolean | `@${string}`,
	/** The subtotal of line items and their discounts, excluding line items that have been removed. Does not contain order-level discounts, duties, shipping costs, or shipping discounts. Taxes are not included unless the order is a taxes-included order. */
	currentSubtotalPrice?:ValueTypes["MoneyV2"],
	/** The total cost of duties for the order, including refunds. */
	currentTotalDuties?:ValueTypes["MoneyV2"],
	/** The total amount of the order, including duties, taxes and discounts, minus amounts for line items that have been removed. */
	currentTotalPrice?:ValueTypes["MoneyV2"],
	/** The total of all taxes applied to the order, excluding taxes for returned line items. */
	currentTotalTax?:ValueTypes["MoneyV2"],
	/** A list of the custom attributes added to the order. */
	customAttributes?:ValueTypes["Attribute"],
	/** The locale code in which this specific order happened. */
	customerLocale?:boolean | `@${string}`,
	/** The unique URL that the customer can use to access the order. */
	customerUrl?:boolean | `@${string}`,
discountApplications?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["DiscountApplicationConnection"]],
	/** Whether the order has had any edits applied or not. */
	edited?:boolean | `@${string}`,
	/** The customer's email address. */
	email?:boolean | `@${string}`,
	/** The financial status of the order. */
	financialStatus?:boolean | `@${string}`,
	/** The fulfillment status for the order. */
	fulfillmentStatus?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
lineItems?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["OrderLineItemConnection"]],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]],
	/** Unique identifier for the order that appears on the order.
For example, _#1000_ or _Store1001.
 */
	name?:boolean | `@${string}`,
	/** A unique numeric identifier for the order for use by shop owner and customer. */
	orderNumber?:boolean | `@${string}`,
	/** The total cost of duties charged at checkout. */
	originalTotalDuties?:ValueTypes["MoneyV2"],
	/** The total price of the order before any applied edits. */
	originalTotalPrice?:ValueTypes["MoneyV2"],
	/** The customer's phone number for receiving SMS notifications. */
	phone?:boolean | `@${string}`,
	/** The date and time when the order was imported.
This value can be set to dates in the past when importing from other systems.
If no value is provided, it will be auto-generated based on current date and time.
 */
	processedAt?:boolean | `@${string}`,
	/** The address to where the order will be shipped. */
	shippingAddress?:ValueTypes["MailingAddress"],
	/** The discounts that have been allocated onto the shipping line by discount applications.
 */
	shippingDiscountAllocations?:ValueTypes["DiscountAllocation"],
	/** The unique URL for the order's status page. */
	statusUrl?:boolean | `@${string}`,
	/** Price of the order before shipping and taxes. */
	subtotalPrice?:ValueTypes["MoneyV2"],
	/** Price of the order before duties, shipping and taxes. */
	subtotalPriceV2?:ValueTypes["MoneyV2"],
successfulFulfillments?: [{	/** Truncate the array result to this size. */
	first?: number | undefined | null | Variable<any, string>},ValueTypes["Fulfillment"]],
	/** The sum of all the prices of all the items in the order, duties, taxes and discounts included (must be positive). */
	totalPrice?:ValueTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the order, duties, taxes and discounts included (must be positive). */
	totalPriceV2?:ValueTypes["MoneyV2"],
	/** The total amount that has been refunded. */
	totalRefunded?:ValueTypes["MoneyV2"],
	/** The total amount that has been refunded. */
	totalRefundedV2?:ValueTypes["MoneyV2"],
	/** The total cost of shipping. */
	totalShippingPrice?:ValueTypes["MoneyV2"],
	/** The total cost of shipping. */
	totalShippingPriceV2?:ValueTypes["MoneyV2"],
	/** The total cost of taxes. */
	totalTax?:ValueTypes["MoneyV2"],
	/** The total cost of taxes. */
	totalTaxV2?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents the reason for the order's cancellation. */
["OrderCancelReason"]:OrderCancelReason;
	/** An auto-generated type for paginating through multiple Orders.
 */
["OrderConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["OrderEdge"],
	/** A list of the nodes contained in OrderEdge. */
	nodes?:ValueTypes["Order"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
	/** The total count of Orders. */
	totalCount?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Order and a cursor during pagination.
 */
["OrderEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of OrderEdge. */
	node?:ValueTypes["Order"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents the order's current financial status. */
["OrderFinancialStatus"]:OrderFinancialStatus;
	/** Represents the order's aggregated fulfillment status for display purposes. */
["OrderFulfillmentStatus"]:OrderFulfillmentStatus;
	/** Represents a single line in an order. There is one line item for each distinct product variant. */
["OrderLineItem"]: AliasType<{
	/** The number of entries associated to the line item minus the items that have been removed. */
	currentQuantity?:boolean | `@${string}`,
	/** List of custom attributes associated to the line item. */
	customAttributes?:ValueTypes["Attribute"],
	/** The discounts that have been allocated onto the order line item by discount applications. */
	discountAllocations?:ValueTypes["DiscountAllocation"],
	/** The total price of the line item, including discounts, and displayed in the presentment currency. */
	discountedTotalPrice?:ValueTypes["MoneyV2"],
	/** The total price of the line item, not including any discounts. The total price is calculated using the original unit price multiplied by the quantity, and it is displayed in the presentment currency. */
	originalTotalPrice?:ValueTypes["MoneyV2"],
	/** The number of products variants associated to the line item. */
	quantity?:boolean | `@${string}`,
	/** The title of the product combined with title of the variant. */
	title?:boolean | `@${string}`,
	/** The product variant object associated to the line item. */
	variant?:ValueTypes["ProductVariant"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple OrderLineItems.
 */
["OrderLineItemConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["OrderLineItemEdge"],
	/** A list of the nodes contained in OrderLineItemEdge. */
	nodes?:ValueTypes["OrderLineItem"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one OrderLineItem and a cursor during pagination.
 */
["OrderLineItemEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of OrderLineItemEdge. */
	node?:ValueTypes["OrderLineItem"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Order query. */
["OrderSortKeys"]:OrderSortKeys;
	/** Shopify merchants can create pages to hold static HTML content. Each Page object represents a custom page on the online store. */
["Page"]: AliasType<{
	/** The description of the page, complete with HTML formatting. */
	body?:boolean | `@${string}`,
	/** Summary of the page body. */
	bodySummary?:boolean | `@${string}`,
	/** The timestamp of the page creation. */
	createdAt?:boolean | `@${string}`,
	/** A human-friendly unique string for the page automatically generated from its title. */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
	/** The page's SEO information. */
	seo?:ValueTypes["SEO"],
	/** The title of the page. */
	title?:boolean | `@${string}`,
	/** The timestamp of the latest page update. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Pages.
 */
["PageConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["PageEdge"],
	/** A list of the nodes contained in PageEdge. */
	nodes?:ValueTypes["Page"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Page and a cursor during pagination.
 */
["PageEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of PageEdge. */
	node?:ValueTypes["Page"],
		__typename?: boolean | `@${string}`
}>;
	/** Returns information about pagination in a connection, in accordance with the
[Relay specification](https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo).
For more information, please read our [GraphQL Pagination Usage Guide](https://shopify.dev/api/usage/pagination-graphql).
 */
["PageInfo"]: AliasType<{
	/** The cursor corresponding to the last node in edges. */
	endCursor?:boolean | `@${string}`,
	/** Whether there are more pages to fetch following the current page. */
	hasNextPage?:boolean | `@${string}`,
	/** Whether there are any pages prior to the current page. */
	hasPreviousPage?:boolean | `@${string}`,
	/** The cursor corresponding to the first node in edges. */
	startCursor?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Page query. */
["PageSortKeys"]:PageSortKeys;
	/** A payment applied to a checkout. */
["Payment"]: AliasType<{
	/** The amount of the payment. */
	amount?:ValueTypes["MoneyV2"],
	/** The amount of the payment. */
	amountV2?:ValueTypes["MoneyV2"],
	/** The billing address for the payment. */
	billingAddress?:ValueTypes["MailingAddress"],
	/** The checkout to which the payment belongs. */
	checkout?:ValueTypes["Checkout"],
	/** The credit card used for the payment in the case of direct payments. */
	creditCard?:ValueTypes["CreditCard"],
	/** A message describing a processing error during asynchronous processing. */
	errorMessage?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** A client-side generated token to identify a payment and perform idempotent operations.
For more information, refer to
[Idempotent requests](https://shopify.dev/api/usage/idempotent-requests).
 */
	idempotencyKey?:boolean | `@${string}`,
	/** The URL where the customer needs to be redirected so they can complete the 3D Secure payment flow. */
	nextActionUrl?:boolean | `@${string}`,
	/** Whether the payment is still processing asynchronously. */
	ready?:boolean | `@${string}`,
	/** A flag to indicate if the payment is to be done in test mode for gateways that support it. */
	test?:boolean | `@${string}`,
	/** The actual transaction recorded by Shopify after having processed the payment with the gateway. */
	transaction?:ValueTypes["Transaction"],
		__typename?: boolean | `@${string}`
}>;
	/** Settings related to payments. */
["PaymentSettings"]: AliasType<{
	/** List of the card brands which the shop accepts. */
	acceptedCardBrands?:boolean | `@${string}`,
	/** The url pointing to the endpoint to vault credit cards. */
	cardVaultUrl?:boolean | `@${string}`,
	/** The country where the shop is located. */
	countryCode?:boolean | `@${string}`,
	/** The three-letter code for the shop's primary currency. */
	currencyCode?:boolean | `@${string}`,
	/** A list of enabled currencies (ISO 4217 format) that the shop accepts. Merchants can enable currencies from their Shopify Payments settings in the Shopify admin. */
	enabledPresentmentCurrencies?:boolean | `@${string}`,
	/** The shop’s Shopify Payments account ID. */
	shopifyPaymentsAccountId?:boolean | `@${string}`,
	/** List of the digital wallets which the shop supports. */
	supportedDigitalWallets?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The valid values for the types of payment token. */
["PaymentTokenType"]:PaymentTokenType;
	/** The input fields for a filter used to view a subset of products in a collection matching a specific price range.
 */
["PriceRangeFilter"]: {
	/** The minimum price in the range. Defaults to zero. */
	min?: number | undefined | null | Variable<any, string>,
	/** The maximum price in the range. Empty indicates no max price. */
	max?: number | undefined | null | Variable<any, string>
};
	/** The value of the percentage pricing object. */
["PricingPercentageValue"]: AliasType<{
	/** The percentage value of the object. */
	percentage?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The price value (fixed or percentage) for a discount application. */
["PricingValue"]: AliasType<{		["...on MoneyV2"] : ValueTypes["MoneyV2"],
		["...on PricingPercentageValue"] : ValueTypes["PricingPercentageValue"]
		__typename?: boolean | `@${string}`
}>;
	/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
For example, a digital download (such as a movie, music or ebook file) also qualifies as a product, as do services (such as equipment rental, work for hire, customization of another product or an extended warranty). */
["Product"]: AliasType<{
	/** Indicates if at least one product variant is available for sale. */
	availableForSale?:boolean | `@${string}`,
collections?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["CollectionConnection"]],
	/** The compare at price of the product across all variants. */
	compareAtPriceRange?:ValueTypes["ProductPriceRange"],
	/** The date and time when the product was created. */
	createdAt?:boolean | `@${string}`,
description?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null | Variable<any, string>},boolean | `@${string}`],
	/** The description of the product, complete with HTML formatting. */
	descriptionHtml?:boolean | `@${string}`,
	/** The featured image for the product.

This field is functionally equivalent to `images(first: 1)`.
 */
	featuredImage?:ValueTypes["Image"],
	/** A human-friendly unique string for the Product automatically generated from its title.
They are used by the Liquid templating language to refer to objects.
 */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
images?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["ProductImageSortKeys"] | undefined | null | Variable<any, string>},ValueTypes["ImageConnection"]],
	/** Whether the product is a gift card. */
	isGiftCard?:boolean | `@${string}`,
media?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["ProductMediaSortKeys"] | undefined | null | Variable<any, string>},ValueTypes["MediaConnection"]],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
options?: [{	/** Truncate the array result to this size. */
	first?: number | undefined | null | Variable<any, string>},ValueTypes["ProductOption"]],
	/** The price range. */
	priceRange?:ValueTypes["ProductPriceRange"],
	/** A categorization that a product can be tagged with, commonly used for filtering and searching. */
	productType?:boolean | `@${string}`,
	/** The date and time when the product was published to the channel. */
	publishedAt?:boolean | `@${string}`,
	/** Whether the product can only be purchased with a selling plan. */
	requiresSellingPlan?:boolean | `@${string}`,
sellingPlanGroups?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["SellingPlanGroupConnection"]],
	/** The product's SEO information. */
	seo?:ValueTypes["SEO"],
	/** A comma separated list of tags that have been added to the product.
Additional access scope required for private apps: unauthenticated_read_product_tags.
 */
	tags?:boolean | `@${string}`,
	/** The product’s title. */
	title?:boolean | `@${string}`,
	/** The total quantity of inventory in stock for this Product. */
	totalInventory?:boolean | `@${string}`,
	/** The date and time when the product was last modified.
A product's `updatedAt` value can change for different reasons. For example, if an order
is placed for a product that has inventory tracking set up, then the inventory adjustment
is counted as an update.
 */
	updatedAt?:boolean | `@${string}`,
variantBySelectedOptions?: [{	/** The input fields used for a selected option. */
	selectedOptions: Array<ValueTypes["SelectedOptionInput"]> | Variable<any, string>},ValueTypes["ProductVariant"]],
variants?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["ProductVariantSortKeys"] | undefined | null | Variable<any, string>},ValueTypes["ProductVariantConnection"]],
	/** The product’s vendor name. */
	vendor?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the ProductCollection query. */
["ProductCollectionSortKeys"]:ProductCollectionSortKeys;
	/** An auto-generated type for paginating through multiple Products.
 */
["ProductConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["ProductEdge"],
	/** A list of available filters. */
	filters?:ValueTypes["Filter"],
	/** A list of the nodes contained in ProductEdge. */
	nodes?:ValueTypes["Product"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Product and a cursor during pagination.
 */
["ProductEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of ProductEdge. */
	node?:ValueTypes["Product"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for a filter used to view a subset of products in a collection. */
["ProductFilter"]: {
	/** Filter on if the product is available for sale. */
	available?: boolean | undefined | null | Variable<any, string>,
	/** A variant option to filter on. */
	variantOption?: ValueTypes["VariantOptionFilter"] | undefined | null | Variable<any, string>,
	/** The product type to filter on. */
	productType?: string | undefined | null | Variable<any, string>,
	/** The product vendor to filter on. */
	productVendor?: string | undefined | null | Variable<any, string>,
	/** A range of prices to filter with-in. */
	price?: ValueTypes["PriceRangeFilter"] | undefined | null | Variable<any, string>,
	/** A product metafield to filter on. */
	productMetafield?: ValueTypes["MetafieldFilter"] | undefined | null | Variable<any, string>,
	/** A variant metafield to filter on. */
	variantMetafield?: ValueTypes["MetafieldFilter"] | undefined | null | Variable<any, string>,
	/** A product tag to filter on. */
	tag?: string | undefined | null | Variable<any, string>
};
	/** The set of valid sort keys for the ProductImage query. */
["ProductImageSortKeys"]:ProductImageSortKeys;
	/** The set of valid sort keys for the ProductMedia query. */
["ProductMediaSortKeys"]:ProductMediaSortKeys;
	/** Product property names like "Size", "Color", and "Material" that the customers can select.
Variants are selected based on permutations of these options.
255 characters limit each.
 */
["ProductOption"]: AliasType<{
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The product option’s name. */
	name?:boolean | `@${string}`,
	/** The corresponding value to the product option name. */
	values?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The price range of the product. */
["ProductPriceRange"]: AliasType<{
	/** The highest variant's price. */
	maxVariantPrice?:ValueTypes["MoneyV2"],
	/** The lowest variant's price. */
	minVariantPrice?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Product query. */
["ProductSortKeys"]:ProductSortKeys;
	/** A product variant represents a different version of a product, such as differing sizes or differing colors. */
["ProductVariant"]: AliasType<{
	/** Indicates if the product variant is available for sale. */
	availableForSale?:boolean | `@${string}`,
	/** The barcode (for example, ISBN, UPC, or GTIN) associated with the variant. */
	barcode?:boolean | `@${string}`,
	/** The compare at price of the variant. This can be used to mark a variant as on sale, when `compareAtPrice` is higher than `price`. */
	compareAtPrice?:ValueTypes["MoneyV2"],
	/** The compare at price of the variant. This can be used to mark a variant as on sale, when `compareAtPriceV2` is higher than `priceV2`. */
	compareAtPriceV2?:ValueTypes["MoneyV2"],
	/** Whether a product is out of stock but still available for purchase (used for backorders). */
	currentlyNotInStock?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** Image associated with the product variant. This field falls back to the product image if no image is available.
 */
	image?:ValueTypes["Image"],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]],
	/** The product variant’s price. */
	price?:ValueTypes["MoneyV2"],
	/** The product variant’s price. */
	priceV2?:ValueTypes["MoneyV2"],
	/** The product object that the product variant belongs to. */
	product?:ValueTypes["Product"],
	/** The total sellable quantity of the variant for online sales channels. */
	quantityAvailable?:boolean | `@${string}`,
	/** Whether a customer needs to provide a shipping address when placing an order for the product variant. */
	requiresShipping?:boolean | `@${string}`,
	/** List of product options applied to the variant. */
	selectedOptions?:ValueTypes["SelectedOption"],
sellingPlanAllocations?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["SellingPlanAllocationConnection"]],
	/** The SKU (stock keeping unit) associated with the variant. */
	sku?:boolean | `@${string}`,
storeAvailability?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Used to sort results based on proximity to the provided location. */
	near?: ValueTypes["GeoCoordinateInput"] | undefined | null | Variable<any, string>},ValueTypes["StoreAvailabilityConnection"]],
	/** The product variant’s title. */
	title?:boolean | `@${string}`,
	/** The unit price value for the variant based on the variant's measurement. */
	unitPrice?:ValueTypes["MoneyV2"],
	/** The unit price measurement for the variant. */
	unitPriceMeasurement?:ValueTypes["UnitPriceMeasurement"],
	/** The weight of the product variant in the unit system specified with `weight_unit`. */
	weight?:boolean | `@${string}`,
	/** Unit of measurement for weight. */
	weightUnit?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple ProductVariants.
 */
["ProductVariantConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["ProductVariantEdge"],
	/** A list of the nodes contained in ProductVariantEdge. */
	nodes?:ValueTypes["ProductVariant"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one ProductVariant and a cursor during pagination.
 */
["ProductVariantEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of ProductVariantEdge. */
	node?:ValueTypes["ProductVariant"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the ProductVariant query. */
["ProductVariantSortKeys"]:ProductVariantSortKeys;
	/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
["QueryRoot"]: AliasType<{
articles?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["ArticleSortKeys"] | undefined | null | Variable<any, string>,	/** Supported filter parameters:
 - `author`
 - `blog_title`
 - `created_at`
 - `tag`
 - `tag_not`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null | Variable<any, string>},ValueTypes["ArticleConnection"]],
blog?: [{	/** The ID of the `Blog`. */
	id?: string | undefined | null | Variable<any, string>,	/** The handle of the `Blog`. */
	handle?: string | undefined | null | Variable<any, string>},ValueTypes["Blog"]],
blogByHandle?: [{	/** The handle of the blog. */
	handle: string | Variable<any, string>},ValueTypes["Blog"]],
blogs?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["BlogSortKeys"] | undefined | null | Variable<any, string>,	/** Supported filter parameters:
 - `created_at`
 - `handle`
 - `title`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null | Variable<any, string>},ValueTypes["BlogConnection"]],
cart?: [{	/** The ID of the cart. */
	id: string | Variable<any, string>},ValueTypes["Cart"]],
collection?: [{	/** The ID of the `Collection`. */
	id?: string | undefined | null | Variable<any, string>,	/** The handle of the `Collection`. */
	handle?: string | undefined | null | Variable<any, string>},ValueTypes["Collection"]],
collectionByHandle?: [{	/** The handle of the collection. */
	handle: string | Variable<any, string>},ValueTypes["Collection"]],
collections?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["CollectionSortKeys"] | undefined | null | Variable<any, string>,	/** Supported filter parameters:
 - `collection_type`
 - `title`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null | Variable<any, string>},ValueTypes["CollectionConnection"]],
customer?: [{	/** The customer access token. */
	customerAccessToken: string | Variable<any, string>},ValueTypes["Customer"]],
	/** Returns the localized experiences configured for the shop. */
	localization?:ValueTypes["Localization"],
locations?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["LocationSortKeys"] | undefined | null | Variable<any, string>,	/** Used to sort results based on proximity to the provided location. */
	near?: ValueTypes["GeoCoordinateInput"] | undefined | null | Variable<any, string>},ValueTypes["LocationConnection"]],
menu?: [{	/** The navigation menu's handle. */
	handle: string | Variable<any, string>},ValueTypes["Menu"]],
metaobject?: [{	/** The ID of the metaobject. */
	id?: string | undefined | null | Variable<any, string>,	/** The handle and type of the metaobject. */
	handle?: ValueTypes["MetaobjectHandleInput"] | undefined | null | Variable<any, string>},ValueTypes["Metaobject"]],
metaobjects?: [{	/** The type of metaobject to retrieve. */
	type: string | Variable<any, string>,	/** The key of a field to sort with. Supports "id" and "updated_at". */
	sortKey?: string | undefined | null | Variable<any, string>,	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["MetaobjectConnection"]],
node?: [{	/** The ID of the Node to return. */
	id: string | Variable<any, string>},ValueTypes["Node"]],
nodes?: [{	/** The IDs of the Nodes to return. */
	ids: Array<string> | Variable<any, string>},ValueTypes["Node"]],
page?: [{	/** The ID of the `Page`. */
	id?: string | undefined | null | Variable<any, string>,	/** The handle of the `Page`. */
	handle?: string | undefined | null | Variable<any, string>},ValueTypes["Page"]],
pageByHandle?: [{	/** The handle of the page. */
	handle: string | Variable<any, string>},ValueTypes["Page"]],
pages?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["PageSortKeys"] | undefined | null | Variable<any, string>,	/** Supported filter parameters:
 - `created_at`
 - `handle`
 - `title`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null | Variable<any, string>},ValueTypes["PageConnection"]],
product?: [{	/** The ID of the `Product`. */
	id?: string | undefined | null | Variable<any, string>,	/** The handle of the `Product`. */
	handle?: string | undefined | null | Variable<any, string>},ValueTypes["Product"]],
productByHandle?: [{	/** A unique string that identifies the product. Handles are automatically generated based on the product's title, and are always lowercase. Whitespace and special characters are replaced with a hyphen: `-`. If there are multiple consecutive whitespace or special characters, then they're replaced with a single hyphen. Whitespace or special characters at the beginning are removed. If a duplicate product title is used, then the handle is auto-incremented by one. For example, if you had two products called `Potion`, then their handles would be `potion` and `potion-1`. After a product has been created, changing the product title doesn't update the handle. */
	handle: string | Variable<any, string>},ValueTypes["Product"]],
productRecommendations?: [{	/** The id of the product. */
	productId: string | Variable<any, string>},ValueTypes["Product"]],
productTags?: [{	/** Returns up to the first `n` elements from the list. */
	first: number | Variable<any, string>},ValueTypes["StringConnection"]],
productTypes?: [{	/** Returns up to the first `n` elements from the list. */
	first: number | Variable<any, string>},ValueTypes["StringConnection"]],
products?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Sort the underlying list by the given key. */
	sortKey?: ValueTypes["ProductSortKeys"] | undefined | null | Variable<any, string>,	/** Supported filter parameters:
 - `available_for_sale`
 - `created_at`
 - `product_type`
 - `tag`
 - `tag_not`
 - `title`
 - `updated_at`
 - `variants.price`
 - `vendor`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null | Variable<any, string>},ValueTypes["ProductConnection"]],
	/** The list of public Storefront API versions, including supported, release candidate and unstable versions. */
	publicApiVersions?:ValueTypes["ApiVersion"],
	/** The shop associated with the storefront access token. */
	shop?:ValueTypes["Shop"],
urlRedirects?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>,	/** Supported filter parameters:
 - `created_at`
 - `path`
 - `target`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null | Variable<any, string>},ValueTypes["UrlRedirectConnection"]],
		__typename?: boolean | `@${string}`
}>;
	/** SEO information. */
["SEO"]: AliasType<{
	/** The meta description. */
	description?:boolean | `@${string}`,
	/** The SEO title. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Script discount applications capture the intentions of a discount that
was created by a Shopify Script.
 */
["ScriptDiscountApplication"]: AliasType<{
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The title of the application as defined by the Script. */
	title?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ValueTypes["PricingValue"],
		__typename?: boolean | `@${string}`
}>;
	/** Properties used by customers to select a product variant.
Products can have multiple options, like different sizes or colors.
 */
["SelectedOption"]: AliasType<{
	/** The product option’s name. */
	name?:boolean | `@${string}`,
	/** The product option’s value. */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields required for a selected option. */
["SelectedOptionInput"]: {
	/** The product option’s name. */
	name: string | Variable<any, string>,
	/** The product option’s value. */
	value: string | Variable<any, string>
};
	/** Represents how products and variants can be sold and purchased. */
["SellingPlan"]: AliasType<{
	/** The initial payment due for the purchase. */
	checkoutCharge?:ValueTypes["SellingPlanCheckoutCharge"],
	/** The description of the selling plan. */
	description?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'. */
	name?:boolean | `@${string}`,
	/** The selling plan options available in the drop-down list in the storefront. For example, 'Delivery every week' or 'Delivery every 2 weeks' specifies the delivery frequency options for the product. Individual selling plans contribute their options to the associated selling plan group. For example, a selling plan group might have an option called `option1: Delivery every`. One selling plan in that group could contribute `option1: 2 weeks` with the pricing for that option, and another selling plan could contribute `option1: 4 weeks`, with different pricing. */
	options?:ValueTypes["SellingPlanOption"],
	/** The price adjustments that a selling plan makes when a variant is purchased with a selling plan. */
	priceAdjustments?:ValueTypes["SellingPlanPriceAdjustment"],
	/** Whether purchasing the selling plan will result in multiple deliveries. */
	recurringDeliveries?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents an association between a variant and a selling plan. Selling plan allocations describe the options offered for each variant, and the price of the variant when purchased with a selling plan. */
["SellingPlanAllocation"]: AliasType<{
	/** The checkout charge amount due for the purchase. */
	checkoutChargeAmount?:ValueTypes["MoneyV2"],
	/** A list of price adjustments, with a maximum of two. When there are two, the first price adjustment goes into effect at the time of purchase, while the second one starts after a certain number of orders. A price adjustment represents how a selling plan affects pricing when a variant is purchased with a selling plan. Prices display in the customer's currency if the shop is configured for it. */
	priceAdjustments?:ValueTypes["SellingPlanAllocationPriceAdjustment"],
	/** The remaining balance charge amount due for the purchase. */
	remainingBalanceChargeAmount?:ValueTypes["MoneyV2"],
	/** A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'. */
	sellingPlan?:ValueTypes["SellingPlan"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple SellingPlanAllocations.
 */
["SellingPlanAllocationConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["SellingPlanAllocationEdge"],
	/** A list of the nodes contained in SellingPlanAllocationEdge. */
	nodes?:ValueTypes["SellingPlanAllocation"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one SellingPlanAllocation and a cursor during pagination.
 */
["SellingPlanAllocationEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of SellingPlanAllocationEdge. */
	node?:ValueTypes["SellingPlanAllocation"],
		__typename?: boolean | `@${string}`
}>;
	/** The resulting prices for variants when they're purchased with a specific selling plan. */
["SellingPlanAllocationPriceAdjustment"]: AliasType<{
	/** The price of the variant when it's purchased without a selling plan for the same number of deliveries. For example, if a customer purchases 6 deliveries of $10.00 granola separately, then the price is 6 x $10.00 = $60.00. */
	compareAtPrice?:ValueTypes["MoneyV2"],
	/** The effective price for a single delivery. For example, for a prepaid subscription plan that includes 6 deliveries at the price of $48.00, the per delivery price is $8.00. */
	perDeliveryPrice?:ValueTypes["MoneyV2"],
	/** The price of the variant when it's purchased with a selling plan For example, for a prepaid subscription plan that includes 6 deliveries of $10.00 granola, where the customer gets 20% off, the price is 6 x $10.00 x 0.80 = $48.00. */
	price?:ValueTypes["MoneyV2"],
	/** The resulting price per unit for the variant associated with the selling plan. If the variant isn't sold by quantity or measurement, then this field returns `null`. */
	unitPrice?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The initial payment due for the purchase. */
["SellingPlanCheckoutCharge"]: AliasType<{
	/** The charge type for the checkout charge. */
	type?:boolean | `@${string}`,
	/** The charge value for the checkout charge. */
	value?:ValueTypes["SellingPlanCheckoutChargeValue"],
		__typename?: boolean | `@${string}`
}>;
	/** The percentage value of the price used for checkout charge. */
["SellingPlanCheckoutChargePercentageValue"]: AliasType<{
	/** The percentage value of the price used for checkout charge. */
	percentage?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The checkout charge when the full amount isn't charged at checkout. */
["SellingPlanCheckoutChargeType"]:SellingPlanCheckoutChargeType;
	/** The portion of the price to be charged at checkout. */
["SellingPlanCheckoutChargeValue"]: AliasType<{		["...on MoneyV2"] : ValueTypes["MoneyV2"],
		["...on SellingPlanCheckoutChargePercentageValue"] : ValueTypes["SellingPlanCheckoutChargePercentageValue"]
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple SellingPlans.
 */
["SellingPlanConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["SellingPlanEdge"],
	/** A list of the nodes contained in SellingPlanEdge. */
	nodes?:ValueTypes["SellingPlan"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one SellingPlan and a cursor during pagination.
 */
["SellingPlanEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of SellingPlanEdge. */
	node?:ValueTypes["SellingPlan"],
		__typename?: boolean | `@${string}`
}>;
	/** A fixed amount that's deducted from the original variant price. For example, $10.00 off. */
["SellingPlanFixedAmountPriceAdjustment"]: AliasType<{
	/** The money value of the price adjustment. */
	adjustmentAmount?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** A fixed price adjustment for a variant that's purchased with a selling plan. */
["SellingPlanFixedPriceAdjustment"]: AliasType<{
	/** A new price of the variant when it's purchased with the selling plan. */
	price?:ValueTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a selling method. For example, 'Subscribe and save' is a selling method where customers pay for goods or services per delivery. A selling plan group contains individual selling plans. */
["SellingPlanGroup"]: AliasType<{
	/** A display friendly name for the app that created the selling plan group. */
	appName?:boolean | `@${string}`,
	/** The name of the selling plan group. */
	name?:boolean | `@${string}`,
	/** Represents the selling plan options available in the drop-down list in the storefront. For example, 'Delivery every week' or 'Delivery every 2 weeks' specifies the delivery frequency options for the product. */
	options?:ValueTypes["SellingPlanGroupOption"],
sellingPlans?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null | Variable<any, string>,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null | Variable<any, string>,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null | Variable<any, string>,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null | Variable<any, string>},ValueTypes["SellingPlanConnection"]],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple SellingPlanGroups.
 */
["SellingPlanGroupConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["SellingPlanGroupEdge"],
	/** A list of the nodes contained in SellingPlanGroupEdge. */
	nodes?:ValueTypes["SellingPlanGroup"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one SellingPlanGroup and a cursor during pagination.
 */
["SellingPlanGroupEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of SellingPlanGroupEdge. */
	node?:ValueTypes["SellingPlanGroup"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an option on a selling plan group that's available in the drop-down list in the storefront.

Individual selling plans contribute their options to the associated selling plan group. For example, a selling plan group might have an option called `option1: Delivery every`. One selling plan in that group could contribute `option1: 2 weeks` with the pricing for that option, and another selling plan could contribute `option1: 4 weeks`, with different pricing. */
["SellingPlanGroupOption"]: AliasType<{
	/** The name of the option. For example, 'Delivery every'. */
	name?:boolean | `@${string}`,
	/** The values for the options specified by the selling plans in the selling plan group. For example, '1 week', '2 weeks', '3 weeks'. */
	values?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An option provided by a Selling Plan. */
["SellingPlanOption"]: AliasType<{
	/** The name of the option (ie "Delivery every"). */
	name?:boolean | `@${string}`,
	/** The value of the option (ie "Month"). */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A percentage amount that's deducted from the original variant price. For example, 10% off. */
["SellingPlanPercentagePriceAdjustment"]: AliasType<{
	/** The percentage value of the price adjustment. */
	adjustmentPercentage?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents by how much the price of a variant associated with a selling plan is adjusted. Each variant can have up to two price adjustments. If a variant has multiple price adjustments, then the first price adjustment applies when the variant is initially purchased. The second price adjustment applies after a certain number of orders (specified by the `orderCount` field) are made. If a selling plan doesn't have any price adjustments, then the unadjusted price of the variant is the effective price. */
["SellingPlanPriceAdjustment"]: AliasType<{
	/** The type of price adjustment. An adjustment value can have one of three types: percentage, amount off, or a new price. */
	adjustmentValue?:ValueTypes["SellingPlanPriceAdjustmentValue"],
	/** The number of orders that the price adjustment applies to. If the price adjustment always applies, then this field is `null`. */
	orderCount?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents by how much the price of a variant associated with a selling plan is adjusted. Each variant can have up to two price adjustments. */
["SellingPlanPriceAdjustmentValue"]: AliasType<{		["...on SellingPlanFixedAmountPriceAdjustment"] : ValueTypes["SellingPlanFixedAmountPriceAdjustment"],
		["...on SellingPlanFixedPriceAdjustment"] : ValueTypes["SellingPlanFixedPriceAdjustment"],
		["...on SellingPlanPercentagePriceAdjustment"] : ValueTypes["SellingPlanPercentagePriceAdjustment"]
		__typename?: boolean | `@${string}`
}>;
	/** A shipping rate to be applied to a checkout. */
["ShippingRate"]: AliasType<{
	/** Human-readable unique identifier for this shipping rate. */
	handle?:boolean | `@${string}`,
	/** Price of this shipping rate. */
	price?:ValueTypes["MoneyV2"],
	/** Price of this shipping rate. */
	priceV2?:ValueTypes["MoneyV2"],
	/** Title of this shipping rate. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Shop represents a collection of the general settings and information about the shop. */
["Shop"]: AliasType<{
	/** The shop's branding configuration. */
	brand?:ValueTypes["Brand"],
	/** A description of the shop. */
	description?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
metafield?: [{	/** A container for a set of metafields. */
	namespace: string | Variable<any, string>,	/** The identifier for the metafield. */
	key: string | Variable<any, string>},ValueTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ValueTypes["HasMetafieldsIdentifier"]> | Variable<any, string>},ValueTypes["Metafield"]],
	/** A string representing the way currency is formatted when the currency isn’t specified. */
	moneyFormat?:boolean | `@${string}`,
	/** The shop’s name. */
	name?:boolean | `@${string}`,
	/** Settings related to payments. */
	paymentSettings?:ValueTypes["PaymentSettings"],
	/** The primary domain of the shop’s Online Store. */
	primaryDomain?:ValueTypes["Domain"],
	/** The shop’s privacy policy. */
	privacyPolicy?:ValueTypes["ShopPolicy"],
	/** The shop’s refund policy. */
	refundPolicy?:ValueTypes["ShopPolicy"],
	/** The shop’s shipping policy. */
	shippingPolicy?:ValueTypes["ShopPolicy"],
	/** Countries that the shop ships to. */
	shipsToCountries?:boolean | `@${string}`,
	/** The shop’s subscription policy. */
	subscriptionPolicy?:ValueTypes["ShopPolicyWithDefault"],
	/** The shop’s terms of service. */
	termsOfService?:ValueTypes["ShopPolicy"],
		__typename?: boolean | `@${string}`
}>;
	/** Policy that a merchant has configured for their store, such as their refund or privacy policy. */
["ShopPolicy"]: AliasType<{
	/** Policy text, maximum size of 64kb. */
	body?:boolean | `@${string}`,
	/** Policy’s handle. */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** Policy’s title. */
	title?:boolean | `@${string}`,
	/** Public URL to the policy. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A policy for the store that comes with a default value, such as a subscription policy.
If the merchant hasn't configured a policy for their store, then the policy will return the default value.
Otherwise, the policy will return the merchant-configured value.
 */
["ShopPolicyWithDefault"]: AliasType<{
	/** The text of the policy. Maximum size: 64KB. */
	body?:boolean | `@${string}`,
	/** The handle of the policy. */
	handle?:boolean | `@${string}`,
	/** The unique ID of the policy. A default policy doesn't have an ID. */
	id?:boolean | `@${string}`,
	/** The title of the policy. */
	title?:boolean | `@${string}`,
	/** Public URL to the policy. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The availability of a product variant at a particular location.
Local pick-up must be enabled in the  store's shipping settings, otherwise this will return an empty result.
 */
["StoreAvailability"]: AliasType<{
	/** Whether the product variant is in-stock at this location. */
	available?:boolean | `@${string}`,
	/** The location where this product variant is stocked at. */
	location?:ValueTypes["Location"],
	/** Returns the estimated amount of time it takes for pickup to be ready (Example: Usually ready in 24 hours). */
	pickUpTime?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple StoreAvailabilities.
 */
["StoreAvailabilityConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["StoreAvailabilityEdge"],
	/** A list of the nodes contained in StoreAvailabilityEdge. */
	nodes?:ValueTypes["StoreAvailability"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one StoreAvailability and a cursor during pagination.
 */
["StoreAvailabilityEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of StoreAvailabilityEdge. */
	node?:ValueTypes["StoreAvailability"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through a list of Strings.
 */
["StringConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["StringEdge"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one String and a cursor during pagination.
 */
["StringEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of StringEdge. */
	node?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Specifies the fields required to complete a checkout with
a tokenized payment.
 */
["TokenizedPaymentInputV3"]: {
	/** The amount and currency of the payment. */
	paymentAmount: ValueTypes["MoneyInput"] | Variable<any, string>,
	/** A unique client generated key used to avoid duplicate charges. When a duplicate payment is found, the original is returned instead of creating a new one. For more information, refer to [Idempotent requests](https://shopify.dev/api/usage/idempotent-requests). */
	idempotencyKey: string | Variable<any, string>,
	/** The billing address for the payment. */
	billingAddress: ValueTypes["MailingAddressInput"] | Variable<any, string>,
	/** A simple string or JSON containing the required payment data for the tokenized payment. */
	paymentData: string | Variable<any, string>,
	/** Whether to execute the payment in test mode, if possible. Test mode is not supported in production stores. Defaults to `false`. */
	test?: boolean | undefined | null | Variable<any, string>,
	/** Public Hash Key used for AndroidPay payments only. */
	identifier?: string | undefined | null | Variable<any, string>,
	/** The type of payment token. */
	type: ValueTypes["PaymentTokenType"] | Variable<any, string>
};
	/** An object representing exchange of money for a product or service. */
["Transaction"]: AliasType<{
	/** The amount of money that the transaction was for. */
	amount?:ValueTypes["MoneyV2"],
	/** The amount of money that the transaction was for. */
	amountV2?:ValueTypes["MoneyV2"],
	/** The kind of the transaction. */
	kind?:boolean | `@${string}`,
	/** The status of the transaction. */
	status?:boolean | `@${string}`,
	/** The status of the transaction. */
	statusV2?:boolean | `@${string}`,
	/** Whether the transaction was done in test mode or not. */
	test?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The different kinds of order transactions. */
["TransactionKind"]:TransactionKind;
	/** Transaction statuses describe the status of a transaction. */
["TransactionStatus"]:TransactionStatus;
	/** Represents an [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986) and
[RFC 3987](https://datatracker.ietf.org/doc/html/rfc3987)-compliant URI string.

For example, `"https://johns-apparel.myshopify.com"` is a valid URL. It includes a scheme (`https`) and a host
(`johns-apparel.myshopify.com`).
 */
["URL"]:unknown;
	/** The measurement used to calculate a unit price for a product variant (e.g. $9.99 / 100ml).
 */
["UnitPriceMeasurement"]: AliasType<{
	/** The type of unit of measurement for the unit price measurement. */
	measuredType?:boolean | `@${string}`,
	/** The quantity unit for the unit price measurement. */
	quantityUnit?:boolean | `@${string}`,
	/** The quantity value for the unit price measurement. */
	quantityValue?:boolean | `@${string}`,
	/** The reference unit for the unit price measurement. */
	referenceUnit?:boolean | `@${string}`,
	/** The reference value for the unit price measurement. */
	referenceValue?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The accepted types of unit of measurement. */
["UnitPriceMeasurementMeasuredType"]:UnitPriceMeasurementMeasuredType;
	/** The valid units of measurement for a unit price measurement. */
["UnitPriceMeasurementMeasuredUnit"]:UnitPriceMeasurementMeasuredUnit;
	/** Systems of weights and measures. */
["UnitSystem"]:UnitSystem;
	/** An unsigned 64-bit integer. Represents whole numeric values between 0 and 2^64 - 1 encoded as a string of base-10 digits.

Example value: `"50"`.
 */
["UnsignedInt64"]:unknown;
	/** A redirect on the online store. */
["UrlRedirect"]: AliasType<{
	/** The ID of the URL redirect. */
	id?:boolean | `@${string}`,
	/** The old path to be redirected from. When the user visits this path, they'll be redirected to the target location. */
	path?:boolean | `@${string}`,
	/** The target location where the user will be redirected to. */
	target?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple UrlRedirects.
 */
["UrlRedirectConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ValueTypes["UrlRedirectEdge"],
	/** A list of the nodes contained in UrlRedirectEdge. */
	nodes?:ValueTypes["UrlRedirect"],
	/** Information to aid in pagination. */
	pageInfo?:ValueTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one UrlRedirect and a cursor during pagination.
 */
["UrlRedirectEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of UrlRedirectEdge. */
	node?:ValueTypes["UrlRedirect"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error in the input of a mutation. */
["UserError"]: AliasType<{
	/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for a filter used to view a subset of products in a collection matching a specific variant option.
 */
["VariantOptionFilter"]: {
	/** The name of the variant option to filter on. */
	name: string | Variable<any, string>,
	/** The value of the variant option to filter on. */
	value: string | Variable<any, string>
};
	/** Represents a Shopify hosted video. */
["Video"]: AliasType<{
	/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ValueTypes["Image"],
	/** The sources for a video. */
	sources?:ValueTypes["VideoSource"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a source for a Shopify hosted video. */
["VideoSource"]: AliasType<{
	/** The format of the video source. */
	format?:boolean | `@${string}`,
	/** The height of the video. */
	height?:boolean | `@${string}`,
	/** The video MIME type. */
	mimeType?:boolean | `@${string}`,
	/** The URL of the video. */
	url?:boolean | `@${string}`,
	/** The width of the video. */
	width?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Units of measurement for weight. */
["WeightUnit"]:WeightUnit
  }

export type ResolverInputTypes = {
    /** A version of the API, as defined by [Shopify API versioning](https://shopify.dev/api/usage/versioning).
Versions are commonly referred to by their handle (for example, `2021-10`).
 */
["ApiVersion"]: AliasType<{
	/** The human-readable name of the version. */
	displayName?:boolean | `@${string}`,
	/** The unique identifier of an ApiVersion. All supported API versions have a date-based (YYYY-MM) or `unstable` handle. */
	handle?:boolean | `@${string}`,
	/** Whether the version is actively supported by Shopify. Supported API versions are guaranteed to be stable. Unsupported API versions include unstable, release candidate, and end-of-life versions that are marked as unsupported. For more information, refer to [Versioning](https://shopify.dev/api/usage/versioning). */
	supported?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Details about the gift card used on the checkout. */
["AppliedGiftCard"]: AliasType<{
	/** The amount that was taken from the gift card by applying it. */
	amountUsed?:ResolverInputTypes["MoneyV2"],
	/** The amount that was taken from the gift card by applying it. */
	amountUsedV2?:ResolverInputTypes["MoneyV2"],
	/** The amount left on the gift card. */
	balance?:ResolverInputTypes["MoneyV2"],
	/** The amount left on the gift card. */
	balanceV2?:ResolverInputTypes["MoneyV2"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The last characters of the gift card. */
	lastCharacters?:boolean | `@${string}`,
	/** The amount that was applied to the checkout in its currency. */
	presentmentAmountUsed?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** An article in an online store blog. */
["Article"]: AliasType<{
	/** The article's author. */
	author?:ResolverInputTypes["ArticleAuthor"],
	/** The article's author. */
	authorV2?:ResolverInputTypes["ArticleAuthor"],
	/** The blog that the article belongs to. */
	blog?:ResolverInputTypes["Blog"],
comments?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["CommentConnection"]],
content?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null},boolean | `@${string}`],
	/** The content of the article, complete with HTML formatting. */
	contentHtml?:boolean | `@${string}`,
excerpt?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null},boolean | `@${string}`],
	/** The excerpt of the article, complete with HTML formatting. */
	excerptHtml?:boolean | `@${string}`,
	/** A human-friendly unique string for the Article automatically generated from its title.
 */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The image associated with the article. */
	image?:ResolverInputTypes["Image"],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
	/** The date and time when the article was published. */
	publishedAt?:boolean | `@${string}`,
	/** The article’s SEO information. */
	seo?:ResolverInputTypes["SEO"],
	/** A categorization that a article can be tagged with. */
	tags?:boolean | `@${string}`,
	/** The article’s name. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The author of an article. */
["ArticleAuthor"]: AliasType<{
	/** The author's bio. */
	bio?:boolean | `@${string}`,
	/** The author’s email. */
	email?:boolean | `@${string}`,
	/** The author's first name. */
	firstName?:boolean | `@${string}`,
	/** The author's last name. */
	lastName?:boolean | `@${string}`,
	/** The author's full name. */
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Articles.
 */
["ArticleConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["ArticleEdge"],
	/** A list of the nodes contained in ArticleEdge. */
	nodes?:ResolverInputTypes["Article"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Article and a cursor during pagination.
 */
["ArticleEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of ArticleEdge. */
	node?:ResolverInputTypes["Article"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Article query. */
["ArticleSortKeys"]:ArticleSortKeys;
	/** Represents a generic custom attribute. */
["Attribute"]: AliasType<{
	/** Key or name of the attribute. */
	key?:boolean | `@${string}`,
	/** Value of the attribute. */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for an attribute. */
["AttributeInput"]: {
	/** Key or name of the attribute. */
	key: string,
	/** Value of the attribute. */
	value: string
};
	/** Automatic discount applications capture the intentions of a discount that was automatically applied.
 */
["AutomaticDiscountApplication"]: AliasType<{
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The title of the application. */
	title?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ResolverInputTypes["PricingValue"],
		__typename?: boolean | `@${string}`
}>;
	/** A collection of available shipping rates for a checkout. */
["AvailableShippingRates"]: AliasType<{
	/** Whether or not the shipping rates are ready.
The `shippingRates` field is `null` when this value is `false`.
This field should be polled until its value becomes `true`.
 */
	ready?:boolean | `@${string}`,
	/** The fetched shipping rates. `null` until the `ready` field is `true`. */
	shippingRates?:ResolverInputTypes["ShippingRate"],
		__typename?: boolean | `@${string}`
}>;
	/** An online store blog. */
["Blog"]: AliasType<{
articleByHandle?: [{	/** The handle of the article. */
	handle: string},ResolverInputTypes["Article"]],
articles?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["ArticleSortKeys"] | undefined | null,	/** Supported filter parameters:
 - `author`
 - `blog_title`
 - `created_at`
 - `tag`
 - `tag_not`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null},ResolverInputTypes["ArticleConnection"]],
	/** The authors who have contributed to the blog. */
	authors?:ResolverInputTypes["ArticleAuthor"],
	/** A human-friendly unique string for the Blog automatically generated from its title.
 */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
	/** The blog's SEO information. */
	seo?:ResolverInputTypes["SEO"],
	/** The blogs’s title. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Blogs.
 */
["BlogConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["BlogEdge"],
	/** A list of the nodes contained in BlogEdge. */
	nodes?:ResolverInputTypes["Blog"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Blog and a cursor during pagination.
 */
["BlogEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of BlogEdge. */
	node?:ResolverInputTypes["Blog"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Blog query. */
["BlogSortKeys"]:BlogSortKeys;
	/** The store's [branding configuration](https://help.shopify.com/en/manual/promoting-marketing/managing-brand-assets).
 */
["Brand"]: AliasType<{
	/** The colors of the store's brand. */
	colors?:ResolverInputTypes["BrandColors"],
	/** The store's cover image. */
	coverImage?:ResolverInputTypes["MediaImage"],
	/** The store's default logo. */
	logo?:ResolverInputTypes["MediaImage"],
	/** The store's short description. */
	shortDescription?:boolean | `@${string}`,
	/** The store's slogan. */
	slogan?:boolean | `@${string}`,
	/** The store's preferred logo for square UI elements. */
	squareLogo?:ResolverInputTypes["MediaImage"],
		__typename?: boolean | `@${string}`
}>;
	/** A group of related colors for the shop's brand.
 */
["BrandColorGroup"]: AliasType<{
	/** The background color. */
	background?:boolean | `@${string}`,
	/** The foreground color. */
	foreground?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The colors of the shop's brand.
 */
["BrandColors"]: AliasType<{
	/** The shop's primary brand colors. */
	primary?:ResolverInputTypes["BrandColorGroup"],
	/** The shop's secondary brand colors. */
	secondary?:ResolverInputTypes["BrandColorGroup"],
		__typename?: boolean | `@${string}`
}>;
	/** Card brand, such as Visa or Mastercard, which can be used for payments. */
["CardBrand"]:CardBrand;
	/** A cart represents the merchandise that a buyer intends to purchase,
and the estimated cost associated with the cart. Learn how to
[interact with a cart](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
during a customer's session.
 */
["Cart"]: AliasType<{
attribute?: [{	/** The key of the attribute. */
	key: string},ResolverInputTypes["Attribute"]],
	/** The attributes associated with the cart. Attributes are represented as key-value pairs. */
	attributes?:ResolverInputTypes["Attribute"],
	/** Information about the buyer that is interacting with the cart. */
	buyerIdentity?:ResolverInputTypes["CartBuyerIdentity"],
	/** The URL of the checkout for the cart. */
	checkoutUrl?:boolean | `@${string}`,
	/** The estimated costs that the buyer will pay at checkout. The costs are subject to change and changes will be reflected at checkout. The `cost` field uses the `buyerIdentity` field to determine [international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing). */
	cost?:ResolverInputTypes["CartCost"],
	/** The date and time when the cart was created. */
	createdAt?:boolean | `@${string}`,
deliveryGroups?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["CartDeliveryGroupConnection"]],
	/** The discounts that have been applied to the entire cart. */
	discountAllocations?:ResolverInputTypes["CartDiscountAllocation"],
	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes?:ResolverInputTypes["CartDiscountCode"],
	/** The estimated costs that the buyer will pay at checkout.
The estimated costs are subject to change and changes will be reflected at checkout.
The `estimatedCost` field uses the `buyerIdentity` field to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
	estimatedCost?:ResolverInputTypes["CartEstimatedCost"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
lines?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["CartLineConnection"]],
	/** A note that is associated with the cart. For example, the note can be a personalized message to the buyer. */
	note?:boolean | `@${string}`,
	/** The total number of items in the cart. */
	totalQuantity?:boolean | `@${string}`,
	/** The date and time when the cart was updated. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartAttributesUpdate` mutation. */
["CartAttributesUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ResolverInputTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The discounts automatically applied to the cart line based on prerequisites that have been met. */
["CartAutomaticDiscountAllocation"]: AliasType<{
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount?:ResolverInputTypes["MoneyV2"],
	/** The title of the allocated discount. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents information about the buyer that is interacting with the cart. */
["CartBuyerIdentity"]: AliasType<{
	/** The country where the buyer is located. */
	countryCode?:boolean | `@${string}`,
	/** The customer account associated with the cart. */
	customer?:ResolverInputTypes["Customer"],
	/** An ordered set of delivery addresses tied to the buyer that is interacting with the cart.
The rank of the preferences is determined by the order of the addresses in the array. Preferences
can be used to populate relevant fields in the checkout flow.
 */
	deliveryAddressPreferences?:ResolverInputTypes["DeliveryAddress"],
	/** The email address of the buyer that is interacting with the cart. */
	email?:boolean | `@${string}`,
	/** The phone number of the buyer that is interacting with the cart. */
	phone?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Specifies the input fields to update the buyer information associated with a cart.
Buyer identity is used to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
and should match the customer's shipping address.
 */
["CartBuyerIdentityInput"]: {
	/** The email address of the buyer that is interacting with the cart. */
	email?: string | undefined | null,
	/** The phone number of the buyer that is interacting with the cart. */
	phone?: string | undefined | null,
	/** The country where the buyer is located. */
	countryCode?: ResolverInputTypes["CountryCode"] | undefined | null,
	/** The access token used to identify the customer associated with the cart. */
	customerAccessToken?: string | undefined | null,
	/** An ordered set of delivery addresses tied to the buyer that is interacting with the cart.
The rank of the preferences is determined by the order of the addresses in the array. Preferences
can be used to populate relevant fields in the checkout flow.
 */
	deliveryAddressPreferences?: Array<ResolverInputTypes["DeliveryAddressInput"]> | undefined | null
};
	/** Return type for `cartBuyerIdentityUpdate` mutation. */
["CartBuyerIdentityUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ResolverInputTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The discount that has been applied to the cart line using a discount code. */
["CartCodeDiscountAllocation"]: AliasType<{
	/** The code used to apply the discount. */
	code?:boolean | `@${string}`,
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The costs that the buyer will pay at checkout.
The cart cost uses [`CartBuyerIdentity`](https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity) to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
["CartCost"]: AliasType<{
	/** The estimated amount, before taxes and discounts, for the customer to pay at checkout. The checkout charge amount doesn't include any deferred payments that'll be paid at a later date. If the cart has no deferred payments, then the checkout charge amount is equivalent to `subtotalAmount`. */
	checkoutChargeAmount?:ResolverInputTypes["MoneyV2"],
	/** The amount, before taxes and cart-level discounts, for the customer to pay. */
	subtotalAmount?:ResolverInputTypes["MoneyV2"],
	/** Whether the subtotal amount is estimated. */
	subtotalAmountEstimated?:boolean | `@${string}`,
	/** The total amount for the customer to pay. */
	totalAmount?:ResolverInputTypes["MoneyV2"],
	/** Whether the total amount is estimated. */
	totalAmountEstimated?:boolean | `@${string}`,
	/** The duty amount for the customer to pay at checkout. */
	totalDutyAmount?:ResolverInputTypes["MoneyV2"],
	/** Whether the total duty amount is estimated. */
	totalDutyAmountEstimated?:boolean | `@${string}`,
	/** The tax amount for the customer to pay at checkout. */
	totalTaxAmount?:ResolverInputTypes["MoneyV2"],
	/** Whether the total tax amount is estimated. */
	totalTaxAmountEstimated?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartCreate` mutation. */
["CartCreatePayload"]: AliasType<{
	/** The new cart. */
	cart?:ResolverInputTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The discounts automatically applied to the cart line based on prerequisites that have been met. */
["CartCustomDiscountAllocation"]: AliasType<{
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount?:ResolverInputTypes["MoneyV2"],
	/** The title of the allocated discount. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Information about the options available for one or more line items to be delivered to a specific address. */
["CartDeliveryGroup"]: AliasType<{
cartLines?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["CartLineConnection"]],
	/** The destination address for the delivery group. */
	deliveryAddress?:ResolverInputTypes["MailingAddress"],
	/** The delivery options available for the delivery group. */
	deliveryOptions?:ResolverInputTypes["CartDeliveryOption"],
	/** The ID for the delivery group. */
	id?:boolean | `@${string}`,
	/** The selected delivery option for the delivery group. */
	selectedDeliveryOption?:ResolverInputTypes["CartDeliveryOption"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple CartDeliveryGroups.
 */
["CartDeliveryGroupConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["CartDeliveryGroupEdge"],
	/** A list of the nodes contained in CartDeliveryGroupEdge. */
	nodes?:ResolverInputTypes["CartDeliveryGroup"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one CartDeliveryGroup and a cursor during pagination.
 */
["CartDeliveryGroupEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CartDeliveryGroupEdge. */
	node?:ResolverInputTypes["CartDeliveryGroup"],
		__typename?: boolean | `@${string}`
}>;
	/** Information about a delivery option. */
["CartDeliveryOption"]: AliasType<{
	/** The code of the delivery option. */
	code?:boolean | `@${string}`,
	/** The method for the delivery option. */
	deliveryMethodType?:boolean | `@${string}`,
	/** The description of the delivery option. */
	description?:boolean | `@${string}`,
	/** The estimated cost for the delivery option. */
	estimatedCost?:ResolverInputTypes["MoneyV2"],
	/** The unique identifier of the delivery option. */
	handle?:boolean | `@${string}`,
	/** The title of the delivery option. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The discounts that have been applied to the cart line. */
["CartDiscountAllocation"]:AliasType<{
		/** The discounted amount that has been applied to the cart line. */
	discountedAmount?:ResolverInputTypes["MoneyV2"];
		['...on CartAutomaticDiscountAllocation']?: Omit<ResolverInputTypes["CartAutomaticDiscountAllocation"],keyof ResolverInputTypes["CartDiscountAllocation"]>;
		['...on CartCodeDiscountAllocation']?: Omit<ResolverInputTypes["CartCodeDiscountAllocation"],keyof ResolverInputTypes["CartDiscountAllocation"]>;
		['...on CartCustomDiscountAllocation']?: Omit<ResolverInputTypes["CartCustomDiscountAllocation"],keyof ResolverInputTypes["CartDiscountAllocation"]>;
		__typename?: boolean | `@${string}`
}>;
	/** The discount codes applied to the cart. */
["CartDiscountCode"]: AliasType<{
	/** Whether the discount code is applicable to the cart's current contents. */
	applicable?:boolean | `@${string}`,
	/** The code for the discount. */
	code?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartDiscountCodesUpdate` mutation. */
["CartDiscountCodesUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ResolverInputTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Possible error codes that can be returned by `CartUserError`. */
["CartErrorCode"]:CartErrorCode;
	/** The estimated costs that the buyer will pay at checkout.
The estimated cost uses
[`CartBuyerIdentity`](https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity)
to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
["CartEstimatedCost"]: AliasType<{
	/** The estimated amount, before taxes and discounts, for the customer to pay at checkout. The checkout charge amount doesn't include any deferred payments that'll be paid at a later date. If the cart has no deferred payments, then the checkout charge amount is equivalent to`subtotal_amount`. */
	checkoutChargeAmount?:ResolverInputTypes["MoneyV2"],
	/** The estimated amount, before taxes and discounts, for the customer to pay. */
	subtotalAmount?:ResolverInputTypes["MoneyV2"],
	/** The estimated total amount for the customer to pay. */
	totalAmount?:ResolverInputTypes["MoneyV2"],
	/** The estimated duty amount for the customer to pay at checkout. */
	totalDutyAmount?:ResolverInputTypes["MoneyV2"],
	/** The estimated tax amount for the customer to pay at checkout. */
	totalTaxAmount?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create a cart. */
["CartInput"]: {
	/** An array of key-value pairs that contains additional information about the cart. */
	attributes?: Array<ResolverInputTypes["AttributeInput"]> | undefined | null,
	/** A list of merchandise lines to add to the cart. */
	lines?: Array<ResolverInputTypes["CartLineInput"]> | undefined | null,
	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes?: Array<string> | undefined | null,
	/** A note that is associated with the cart. For example, the note can be a personalized message to the buyer. */
	note?: string | undefined | null,
	/** The customer associated with the cart. Used to determine [international pricing]
(https://shopify.dev/custom-storefronts/internationalization/international-pricing).
Buyer identity should match the customer's shipping address.
 */
	buyerIdentity?: ResolverInputTypes["CartBuyerIdentityInput"] | undefined | null
};
	/** Represents information about the merchandise in the cart. */
["CartLine"]: AliasType<{
attribute?: [{	/** The key of the attribute. */
	key: string},ResolverInputTypes["Attribute"]],
	/** The attributes associated with the cart line. Attributes are represented as key-value pairs. */
	attributes?:ResolverInputTypes["Attribute"],
	/** The cost of the merchandise that the buyer will pay for at checkout. The costs are subject to change and changes will be reflected at checkout. */
	cost?:ResolverInputTypes["CartLineCost"],
	/** The discounts that have been applied to the cart line. */
	discountAllocations?:ResolverInputTypes["CartDiscountAllocation"],
	/** The estimated cost of the merchandise that the buyer will pay for at checkout. The estimated costs are subject to change and changes will be reflected at checkout. */
	estimatedCost?:ResolverInputTypes["CartLineEstimatedCost"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The merchandise that the buyer intends to purchase. */
	merchandise?:ResolverInputTypes["Merchandise"],
	/** The quantity of the merchandise that the customer intends to purchase. */
	quantity?:boolean | `@${string}`,
	/** The selling plan associated with the cart line and the effect that each selling plan has on variants when they're purchased. */
	sellingPlanAllocation?:ResolverInputTypes["SellingPlanAllocation"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple CartLines.
 */
["CartLineConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["CartLineEdge"],
	/** A list of the nodes contained in CartLineEdge. */
	nodes?:ResolverInputTypes["CartLine"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** The cost of the merchandise line that the buyer will pay at checkout. */
["CartLineCost"]: AliasType<{
	/** The amount of the merchandise line. */
	amountPerQuantity?:ResolverInputTypes["MoneyV2"],
	/** The compare at amount of the merchandise line. */
	compareAtAmountPerQuantity?:ResolverInputTypes["MoneyV2"],
	/** The cost of the merchandise line before line-level discounts. */
	subtotalAmount?:ResolverInputTypes["MoneyV2"],
	/** The total cost of the merchandise line. */
	totalAmount?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one CartLine and a cursor during pagination.
 */
["CartLineEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CartLineEdge. */
	node?:ResolverInputTypes["CartLine"],
		__typename?: boolean | `@${string}`
}>;
	/** The estimated cost of the merchandise line that the buyer will pay at checkout. */
["CartLineEstimatedCost"]: AliasType<{
	/** The amount of the merchandise line. */
	amount?:ResolverInputTypes["MoneyV2"],
	/** The compare at amount of the merchandise line. */
	compareAtAmount?:ResolverInputTypes["MoneyV2"],
	/** The estimated cost of the merchandise line before discounts. */
	subtotalAmount?:ResolverInputTypes["MoneyV2"],
	/** The estimated total cost of the merchandise line. */
	totalAmount?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create a merchandise line on a cart. */
["CartLineInput"]: {
	/** An array of key-value pairs that contains additional information about the merchandise line. */
	attributes?: Array<ResolverInputTypes["AttributeInput"]> | undefined | null,
	/** The quantity of the merchandise. */
	quantity?: number | undefined | null,
	/** The ID of the merchandise that the buyer intends to purchase. */
	merchandiseId: string,
	/** The ID of the selling plan that the merchandise is being purchased with. */
	sellingPlanId?: string | undefined | null
};
	/** The input fields to update a line item on a cart. */
["CartLineUpdateInput"]: {
	/** The ID of the merchandise line. */
	id: string,
	/** The quantity of the line item. */
	quantity?: number | undefined | null,
	/** The ID of the merchandise for the line item. */
	merchandiseId?: string | undefined | null,
	/** An array of key-value pairs that contains additional information about the merchandise line. */
	attributes?: Array<ResolverInputTypes["AttributeInput"]> | undefined | null,
	/** The ID of the selling plan that the merchandise is being purchased with. */
	sellingPlanId?: string | undefined | null
};
	/** Return type for `cartLinesAdd` mutation. */
["CartLinesAddPayload"]: AliasType<{
	/** The updated cart. */
	cart?:ResolverInputTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartLinesRemove` mutation. */
["CartLinesRemovePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ResolverInputTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartLinesUpdate` mutation. */
["CartLinesUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ResolverInputTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `cartNoteUpdate` mutation. */
["CartNoteUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ResolverInputTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for updating the selected delivery options for a delivery group.
 */
["CartSelectedDeliveryOptionInput"]: {
	/** The ID of the cart delivery group. */
	deliveryGroupId: string,
	/** The handle of the selected delivery option. */
	deliveryOptionHandle: string
};
	/** Return type for `cartSelectedDeliveryOptionsUpdate` mutation. */
["CartSelectedDeliveryOptionsUpdatePayload"]: AliasType<{
	/** The updated cart. */
	cart?:ResolverInputTypes["Cart"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CartUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error that happens during execution of a cart mutation. */
["CartUserError"]: AliasType<{
	/** The error code. */
	code?:boolean | `@${string}`,
	/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A container for all the information required to checkout items and pay. */
["Checkout"]: AliasType<{
	/** The gift cards used on the checkout. */
	appliedGiftCards?:ResolverInputTypes["AppliedGiftCard"],
	/** The available shipping rates for this Checkout.
Should only be used when checkout `requiresShipping` is `true` and
the shipping address is valid.
 */
	availableShippingRates?:ResolverInputTypes["AvailableShippingRates"],
	/** The identity of the customer associated with the checkout. */
	buyerIdentity?:ResolverInputTypes["CheckoutBuyerIdentity"],
	/** The date and time when the checkout was completed. */
	completedAt?:boolean | `@${string}`,
	/** The date and time when the checkout was created. */
	createdAt?:boolean | `@${string}`,
	/** The currency code for the checkout. */
	currencyCode?:boolean | `@${string}`,
	/** A list of extra information that is added to the checkout. */
	customAttributes?:ResolverInputTypes["Attribute"],
discountApplications?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["DiscountApplicationConnection"]],
	/** The email attached to this checkout. */
	email?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
lineItems?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["CheckoutLineItemConnection"]],
	/** The sum of all the prices of all the items in the checkout. Duties, taxes, shipping and discounts excluded. */
	lineItemsSubtotalPrice?:ResolverInputTypes["MoneyV2"],
	/** The note associated with the checkout. */
	note?:boolean | `@${string}`,
	/** The resulting order from a paid checkout. */
	order?:ResolverInputTypes["Order"],
	/** The Order Status Page for this Checkout, null when checkout is not completed. */
	orderStatusUrl?:boolean | `@${string}`,
	/** The amount left to be paid. This is equal to the cost of the line items, taxes, and shipping, minus discounts and gift cards. */
	paymentDue?:ResolverInputTypes["MoneyV2"],
	/** The amount left to be paid. This is equal to the cost of the line items, duties, taxes, and shipping, minus discounts and gift cards. */
	paymentDueV2?:ResolverInputTypes["MoneyV2"],
	/** Whether or not the Checkout is ready and can be completed. Checkouts may
have asynchronous operations that can take time to finish. If you want
to complete a checkout or ensure all the fields are populated and up to
date, polling is required until the value is true.
 */
	ready?:boolean | `@${string}`,
	/** States whether or not the fulfillment requires shipping. */
	requiresShipping?:boolean | `@${string}`,
	/** The shipping address to where the line items will be shipped. */
	shippingAddress?:ResolverInputTypes["MailingAddress"],
	/** The discounts that have been allocated onto the shipping line by discount applications.
 */
	shippingDiscountAllocations?:ResolverInputTypes["DiscountAllocation"],
	/** Once a shipping rate is selected by the customer it is transitioned to a `shipping_line` object. */
	shippingLine?:ResolverInputTypes["ShippingRate"],
	/** The price at checkout before shipping and taxes. */
	subtotalPrice?:ResolverInputTypes["MoneyV2"],
	/** The price at checkout before duties, shipping, and taxes. */
	subtotalPriceV2?:ResolverInputTypes["MoneyV2"],
	/** Whether the checkout is tax exempt. */
	taxExempt?:boolean | `@${string}`,
	/** Whether taxes are included in the line item and shipping line prices. */
	taxesIncluded?:boolean | `@${string}`,
	/** The sum of all the duties applied to the line items in the checkout. */
	totalDuties?:ResolverInputTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the checkout, including taxes and duties. */
	totalPrice?:ResolverInputTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the checkout, including taxes and duties. */
	totalPriceV2?:ResolverInputTypes["MoneyV2"],
	/** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
	totalTax?:ResolverInputTypes["MoneyV2"],
	/** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
	totalTaxV2?:ResolverInputTypes["MoneyV2"],
	/** The date and time when the checkout was last updated. */
	updatedAt?:boolean | `@${string}`,
	/** The url pointing to the checkout accessible from the web. */
	webUrl?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields required to update a checkout's attributes. */
["CheckoutAttributesUpdateV2Input"]: {
	/** The text of an optional note that a shop owner can attach to the checkout. */
	note?: string | undefined | null,
	/** A list of extra information that is added to the checkout. */
	customAttributes?: Array<ResolverInputTypes["AttributeInput"]> | undefined | null,
	/** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
The required attributes are city, province, and country.
Full validation of the addresses is still done at completion time. Defaults to `false` with 
each operation.
 */
	allowPartialAddresses?: boolean | undefined | null
};
	/** Return type for `checkoutAttributesUpdateV2` mutation. */
["CheckoutAttributesUpdateV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The identity of the customer associated with the checkout. */
["CheckoutBuyerIdentity"]: AliasType<{
	/** The country code for the checkout. For example, `CA`. */
	countryCode?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for the identity of the customer associated with the checkout. */
["CheckoutBuyerIdentityInput"]: {
	/** The country code of one of the shop's
[enabled countries](https://help.shopify.com/en/manual/payments/shopify-payments/multi-currency/setup).
For example, `CA`. Including this field creates a checkout in the specified country's currency.
 */
	countryCode: ResolverInputTypes["CountryCode"]
};
	/** Return type for `checkoutCompleteFree` mutation. */
["CheckoutCompleteFreePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutCompleteWithCreditCardV2` mutation. */
["CheckoutCompleteWithCreditCardV2Payload"]: AliasType<{
	/** The checkout on which the payment was applied. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** A representation of the attempted payment. */
	payment?:ResolverInputTypes["Payment"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutCompleteWithTokenizedPaymentV3` mutation. */
["CheckoutCompleteWithTokenizedPaymentV3Payload"]: AliasType<{
	/** The checkout on which the payment was applied. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** A representation of the attempted payment. */
	payment?:ResolverInputTypes["Payment"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields required to create a checkout. */
["CheckoutCreateInput"]: {
	/** The email with which the customer wants to checkout. */
	email?: string | undefined | null,
	/** A list of line item objects, each one containing information about an item in the checkout. */
	lineItems?: Array<ResolverInputTypes["CheckoutLineItemInput"]> | undefined | null,
	/** The shipping address to where the line items will be shipped. */
	shippingAddress?: ResolverInputTypes["MailingAddressInput"] | undefined | null,
	/** The text of an optional note that a shop owner can attach to the checkout. */
	note?: string | undefined | null,
	/** A list of extra information that is added to the checkout. */
	customAttributes?: Array<ResolverInputTypes["AttributeInput"]> | undefined | null,
	/** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
The required attributes are city, province, and country.
Full validation of addresses is still done at completion time. Defaults to `null`.
 */
	allowPartialAddresses?: boolean | undefined | null,
	/** The identity of the customer associated with the checkout. */
	buyerIdentity?: ResolverInputTypes["CheckoutBuyerIdentityInput"] | undefined | null
};
	/** Return type for `checkoutCreate` mutation. */
["CheckoutCreatePayload"]: AliasType<{
	/** The new checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The checkout queue token. Available only to selected stores. */
	queueToken?:boolean | `@${string}`,
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutCustomerAssociateV2` mutation. */
["CheckoutCustomerAssociateV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The associated customer object. */
	customer?:ResolverInputTypes["Customer"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutCustomerDisassociateV2` mutation. */
["CheckoutCustomerDisassociateV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutDiscountCodeApplyV2` mutation. */
["CheckoutDiscountCodeApplyV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutDiscountCodeRemove` mutation. */
["CheckoutDiscountCodeRemovePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutEmailUpdateV2` mutation. */
["CheckoutEmailUpdateV2Payload"]: AliasType<{
	/** The checkout object with the updated email. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Possible error codes that can be returned by `CheckoutUserError`. */
["CheckoutErrorCode"]:CheckoutErrorCode;
	/** Return type for `checkoutGiftCardRemoveV2` mutation. */
["CheckoutGiftCardRemoveV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutGiftCardsAppend` mutation. */
["CheckoutGiftCardsAppendPayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** A single line item in the checkout, grouped by variant and attributes. */
["CheckoutLineItem"]: AliasType<{
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?:ResolverInputTypes["Attribute"],
	/** The discounts that have been allocated onto the checkout line item by discount applications. */
	discountAllocations?:ResolverInputTypes["DiscountAllocation"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The quantity of the line item. */
	quantity?:boolean | `@${string}`,
	/** Title of the line item. Defaults to the product's title. */
	title?:boolean | `@${string}`,
	/** Unit price of the line item. */
	unitPrice?:ResolverInputTypes["MoneyV2"],
	/** Product variant of the line item. */
	variant?:ResolverInputTypes["ProductVariant"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple CheckoutLineItems.
 */
["CheckoutLineItemConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["CheckoutLineItemEdge"],
	/** A list of the nodes contained in CheckoutLineItemEdge. */
	nodes?:ResolverInputTypes["CheckoutLineItem"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one CheckoutLineItem and a cursor during pagination.
 */
["CheckoutLineItemEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CheckoutLineItemEdge. */
	node?:ResolverInputTypes["CheckoutLineItem"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create a line item on a checkout. */
["CheckoutLineItemInput"]: {
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?: Array<ResolverInputTypes["AttributeInput"]> | undefined | null,
	/** The quantity of the line item. */
	quantity: number,
	/** The ID of the product variant for the line item. */
	variantId: string
};
	/** The input fields to update a line item on the checkout. */
["CheckoutLineItemUpdateInput"]: {
	/** The ID of the line item. */
	id?: string | undefined | null,
	/** The variant ID of the line item. */
	variantId?: string | undefined | null,
	/** The quantity of the line item. */
	quantity?: number | undefined | null,
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?: Array<ResolverInputTypes["AttributeInput"]> | undefined | null
};
	/** Return type for `checkoutLineItemsAdd` mutation. */
["CheckoutLineItemsAddPayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutLineItemsRemove` mutation. */
["CheckoutLineItemsRemovePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutLineItemsReplace` mutation. */
["CheckoutLineItemsReplacePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["CheckoutUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutLineItemsUpdate` mutation. */
["CheckoutLineItemsUpdatePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutShippingAddressUpdateV2` mutation. */
["CheckoutShippingAddressUpdateV2Payload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `checkoutShippingLineUpdate` mutation. */
["CheckoutShippingLineUpdatePayload"]: AliasType<{
	/** The updated checkout object. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors?:ResolverInputTypes["CheckoutUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error that happens during execution of a checkout mutation. */
["CheckoutUserError"]: AliasType<{
	/** The error code. */
	code?:boolean | `@${string}`,
	/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A collection represents a grouping of products that a shop owner can create to organize them or make their shops easier to browse. */
["Collection"]: AliasType<{
description?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null},boolean | `@${string}`],
	/** The description of the collection, complete with HTML formatting. */
	descriptionHtml?:boolean | `@${string}`,
	/** A human-friendly unique string for the collection automatically generated from its title.
Limit of 255 characters.
 */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** Image associated with the collection. */
	image?:ResolverInputTypes["Image"],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
products?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["ProductCollectionSortKeys"] | undefined | null,	/** Returns a subset of products matching all product filters. */
	filters?: Array<ResolverInputTypes["ProductFilter"]> | undefined | null},ResolverInputTypes["ProductConnection"]],
	/** The collection's SEO information. */
	seo?:ResolverInputTypes["SEO"],
	/** The collection’s name. Limit of 255 characters. */
	title?:boolean | `@${string}`,
	/** The date and time when the collection was last modified. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Collections.
 */
["CollectionConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["CollectionEdge"],
	/** A list of the nodes contained in CollectionEdge. */
	nodes?:ResolverInputTypes["Collection"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Collection and a cursor during pagination.
 */
["CollectionEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CollectionEdge. */
	node?:ResolverInputTypes["Collection"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Collection query. */
["CollectionSortKeys"]:CollectionSortKeys;
	/** A string containing a hexadecimal representation of a color.

For example, "#6A8D48".
 */
["Color"]:unknown;
	/** A comment on an article. */
["Comment"]: AliasType<{
	/** The comment’s author. */
	author?:ResolverInputTypes["CommentAuthor"],
content?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null},boolean | `@${string}`],
	/** The content of the comment, complete with HTML formatting. */
	contentHtml?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The author of a comment. */
["CommentAuthor"]: AliasType<{
	/** The author's email. */
	email?:boolean | `@${string}`,
	/** The author’s name. */
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Comments.
 */
["CommentConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["CommentEdge"],
	/** A list of the nodes contained in CommentEdge. */
	nodes?:ResolverInputTypes["Comment"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Comment and a cursor during pagination.
 */
["CommentEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of CommentEdge. */
	node?:ResolverInputTypes["Comment"],
		__typename?: boolean | `@${string}`
}>;
	/** A country. */
["Country"]: AliasType<{
	/** The languages available for the country. */
	availableLanguages?:ResolverInputTypes["Language"],
	/** The currency of the country. */
	currency?:ResolverInputTypes["Currency"],
	/** The ISO code of the country. */
	isoCode?:boolean | `@${string}`,
	/** The name of the country. */
	name?:boolean | `@${string}`,
	/** The unit system used in the country. */
	unitSystem?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The code designating a country/region, which generally follows ISO 3166-1 alpha-2 guidelines.
If a territory doesn't have a country code value in the `CountryCode` enum, then it might be considered a subdivision
of another country. For example, the territories associated with Spain are represented by the country code `ES`,
and the territories associated with the United States of America are represented by the country code `US`.
 */
["CountryCode"]:CountryCode;
	/** Credit card information used for a payment. */
["CreditCard"]: AliasType<{
	/** The brand of the credit card. */
	brand?:boolean | `@${string}`,
	/** The expiry month of the credit card. */
	expiryMonth?:boolean | `@${string}`,
	/** The expiry year of the credit card. */
	expiryYear?:boolean | `@${string}`,
	/** The credit card's BIN number. */
	firstDigits?:boolean | `@${string}`,
	/** The first name of the card holder. */
	firstName?:boolean | `@${string}`,
	/** The last 4 digits of the credit card. */
	lastDigits?:boolean | `@${string}`,
	/** The last name of the card holder. */
	lastName?:boolean | `@${string}`,
	/** The masked credit card number with only the last 4 digits displayed. */
	maskedNumber?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Specifies the fields required to complete a checkout with
a Shopify vaulted credit card payment.
 */
["CreditCardPaymentInputV2"]: {
	/** The amount and currency of the payment. */
	paymentAmount: ResolverInputTypes["MoneyInput"],
	/** A unique client generated key used to avoid duplicate charges. When a duplicate payment is found, the original is returned instead of creating a new one. For more information, refer to [Idempotent requests](https://shopify.dev/api/usage/idempotent-requests). */
	idempotencyKey: string,
	/** The billing address for the payment. */
	billingAddress: ResolverInputTypes["MailingAddressInput"],
	/** The ID returned by Shopify's Card Vault. */
	vaultId: string,
	/** Executes the payment in test mode if possible. Defaults to `false`. */
	test?: boolean | undefined | null
};
	/** The part of the image that should remain after cropping. */
["CropRegion"]:CropRegion;
	/** A currency. */
["Currency"]: AliasType<{
	/** The ISO code of the currency. */
	isoCode?:boolean | `@${string}`,
	/** The name of the currency. */
	name?:boolean | `@${string}`,
	/** The symbol of the currency. */
	symbol?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The three-letter currency codes that represent the world currencies used in stores. These include standard ISO 4217 codes, legacy codes,
and non-standard codes.
 */
["CurrencyCode"]:CurrencyCode;
	/** A customer represents a customer account with the shop. Customer accounts store contact information for the customer, saving logged-in customers the trouble of having to provide it at every checkout. */
["Customer"]: AliasType<{
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?:boolean | `@${string}`,
addresses?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["MailingAddressConnection"]],
	/** The date and time when the customer was created. */
	createdAt?:boolean | `@${string}`,
	/** The customer’s default address. */
	defaultAddress?:ResolverInputTypes["MailingAddress"],
	/** The customer’s name, email or phone number. */
	displayName?:boolean | `@${string}`,
	/** The customer’s email address. */
	email?:boolean | `@${string}`,
	/** The customer’s first name. */
	firstName?:boolean | `@${string}`,
	/** A unique ID for the customer. */
	id?:boolean | `@${string}`,
	/** The customer's most recently updated, incomplete checkout. */
	lastIncompleteCheckout?:ResolverInputTypes["Checkout"],
	/** The customer’s last name. */
	lastName?:boolean | `@${string}`,
metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]],
	/** The number of orders that the customer has made at the store in their lifetime. */
	numberOfOrders?:boolean | `@${string}`,
orders?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["OrderSortKeys"] | undefined | null,	/** Supported filter parameters:
 - `processed_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null},ResolverInputTypes["OrderConnection"]],
	/** The customer’s phone number. */
	phone?:boolean | `@${string}`,
	/** A comma separated list of tags that have been added to the customer.
Additional access scope required: unauthenticated_read_customer_tags.
 */
	tags?:boolean | `@${string}`,
	/** The date and time when the customer information was updated. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A CustomerAccessToken represents the unique token required to make modifications to the customer object. */
["CustomerAccessToken"]: AliasType<{
	/** The customer’s access token. */
	accessToken?:boolean | `@${string}`,
	/** The date and time when the customer access token expires. */
	expiresAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields required to create a customer access token. */
["CustomerAccessTokenCreateInput"]: {
	/** The email associated to the customer. */
	email: string,
	/** The login password to be used by the customer. */
	password: string
};
	/** Return type for `customerAccessTokenCreate` mutation. */
["CustomerAccessTokenCreatePayload"]: AliasType<{
	/** The newly created customer access token object. */
	customerAccessToken?:ResolverInputTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAccessTokenCreateWithMultipass` mutation. */
["CustomerAccessTokenCreateWithMultipassPayload"]: AliasType<{
	/** An access token object associated with the customer. */
	customerAccessToken?:ResolverInputTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAccessTokenDelete` mutation. */
["CustomerAccessTokenDeletePayload"]: AliasType<{
	/** The destroyed access token. */
	deletedAccessToken?:boolean | `@${string}`,
	/** ID of the destroyed customer access token. */
	deletedCustomerAccessTokenId?:boolean | `@${string}`,
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAccessTokenRenew` mutation. */
["CustomerAccessTokenRenewPayload"]: AliasType<{
	/** The renewed customer access token object. */
	customerAccessToken?:ResolverInputTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerActivateByUrl` mutation. */
["CustomerActivateByUrlPayload"]: AliasType<{
	/** The customer that was activated. */
	customer?:ResolverInputTypes["Customer"],
	/** A new customer access token for the customer. */
	customerAccessToken?:ResolverInputTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to activate a customer. */
["CustomerActivateInput"]: {
	/** The activation token required to activate the customer. */
	activationToken: string,
	/** New password that will be set during activation. */
	password: string
};
	/** Return type for `customerActivate` mutation. */
["CustomerActivatePayload"]: AliasType<{
	/** The customer object. */
	customer?:ResolverInputTypes["Customer"],
	/** A newly created customer access token object for the customer. */
	customerAccessToken?:ResolverInputTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAddressCreate` mutation. */
["CustomerAddressCreatePayload"]: AliasType<{
	/** The new customer address object. */
	customerAddress?:ResolverInputTypes["MailingAddress"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAddressDelete` mutation. */
["CustomerAddressDeletePayload"]: AliasType<{
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** ID of the deleted customer address. */
	deletedCustomerAddressId?:boolean | `@${string}`,
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerAddressUpdate` mutation. */
["CustomerAddressUpdatePayload"]: AliasType<{
	/** The customer’s updated mailing address. */
	customerAddress?:ResolverInputTypes["MailingAddress"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create a new customer. */
["CustomerCreateInput"]: {
	/** The customer’s first name. */
	firstName?: string | undefined | null,
	/** The customer’s last name. */
	lastName?: string | undefined | null,
	/** The customer’s email. */
	email: string,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined | null,
	/** The login password used by the customer. */
	password: string,
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?: boolean | undefined | null
};
	/** Return type for `customerCreate` mutation. */
["CustomerCreatePayload"]: AliasType<{
	/** The created customer object. */
	customer?:ResolverInputTypes["Customer"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerDefaultAddressUpdate` mutation. */
["CustomerDefaultAddressUpdatePayload"]: AliasType<{
	/** The updated customer object. */
	customer?:ResolverInputTypes["Customer"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Possible error codes that can be returned by `CustomerUserError`. */
["CustomerErrorCode"]:CustomerErrorCode;
	/** Return type for `customerRecover` mutation. */
["CustomerRecoverPayload"]: AliasType<{
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Return type for `customerResetByUrl` mutation. */
["CustomerResetByUrlPayload"]: AliasType<{
	/** The customer object which was reset. */
	customer?:ResolverInputTypes["Customer"],
	/** A newly created customer access token object for the customer. */
	customerAccessToken?:ResolverInputTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to reset a customer's password. */
["CustomerResetInput"]: {
	/** The reset token required to reset the customer’s password. */
	resetToken: string,
	/** New password that will be set as part of the reset password process. */
	password: string
};
	/** Return type for `customerReset` mutation. */
["CustomerResetPayload"]: AliasType<{
	/** The customer object which was reset. */
	customer?:ResolverInputTypes["Customer"],
	/** A newly created customer access token object for the customer. */
	customerAccessToken?:ResolverInputTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to update the Customer information. */
["CustomerUpdateInput"]: {
	/** The customer’s first name. */
	firstName?: string | undefined | null,
	/** The customer’s last name. */
	lastName?: string | undefined | null,
	/** The customer’s email. */
	email?: string | undefined | null,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_. To remove the phone number, specify `null`.
 */
	phone?: string | undefined | null,
	/** The login password used by the customer. */
	password?: string | undefined | null,
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?: boolean | undefined | null
};
	/** Return type for `customerUpdate` mutation. */
["CustomerUpdatePayload"]: AliasType<{
	/** The updated customer object. */
	customer?:ResolverInputTypes["Customer"],
	/** The newly created customer access token. If the customer's password is updated, all previous access tokens
(including the one used to perform this mutation) become invalid, and a new token is generated.
 */
	customerAccessToken?:ResolverInputTypes["CustomerAccessToken"],
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors?:ResolverInputTypes["CustomerUserError"],
	/** The list of errors that occurred from executing the mutation. */
	userErrors?:ResolverInputTypes["UserError"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error that happens during execution of a customer mutation. */
["CustomerUserError"]: AliasType<{
	/** The error code. */
	code?:boolean | `@${string}`,
	/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)-encoded date and time string.
For example, 3:50 pm on September 7, 2019 in the time zone of UTC (Coordinated Universal Time) is
represented as `"2019-09-07T15:50:00Z`".
 */
["DateTime"]:unknown;
	/** A signed decimal number, which supports arbitrary precision and is serialized as a string.

Example values: `"29.99"`, `"29.999"`.
 */
["Decimal"]:unknown;
	/** A delivery address of the buyer that is interacting with the cart. */
["DeliveryAddress"]: AliasType<{
	MailingAddress?:ResolverInputTypes["MailingAddress"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for delivery address preferences.
 */
["DeliveryAddressInput"]: {
	/** A delivery address preference of a buyer that is interacting with the cart. */
	deliveryAddress?: ResolverInputTypes["MailingAddressInput"] | undefined | null
};
	/** List of different delivery method types. */
["DeliveryMethodType"]:DeliveryMethodType;
	/** Digital wallet, such as Apple Pay, which can be used for accelerated checkouts. */
["DigitalWallet"]:DigitalWallet;
	/** An amount discounting the line that has been allocated by a discount.
 */
["DiscountAllocation"]: AliasType<{
	/** Amount of discount allocated. */
	allocatedAmount?:ResolverInputTypes["MoneyV2"],
	/** The discount this allocated amount originated from. */
	discountApplication?:ResolverInputTypes["DiscountApplication"],
		__typename?: boolean | `@${string}`
}>;
	/** Discount applications capture the intentions of a discount source at
the time of application.
 */
["DiscountApplication"]:AliasType<{
		/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ResolverInputTypes["PricingValue"];
		['...on AutomaticDiscountApplication']?: Omit<ResolverInputTypes["AutomaticDiscountApplication"],keyof ResolverInputTypes["DiscountApplication"]>;
		['...on DiscountCodeApplication']?: Omit<ResolverInputTypes["DiscountCodeApplication"],keyof ResolverInputTypes["DiscountApplication"]>;
		['...on ManualDiscountApplication']?: Omit<ResolverInputTypes["ManualDiscountApplication"],keyof ResolverInputTypes["DiscountApplication"]>;
		['...on ScriptDiscountApplication']?: Omit<ResolverInputTypes["ScriptDiscountApplication"],keyof ResolverInputTypes["DiscountApplication"]>;
		__typename?: boolean | `@${string}`
}>;
	/** The method by which the discount's value is allocated onto its entitled lines. */
["DiscountApplicationAllocationMethod"]:DiscountApplicationAllocationMethod;
	/** An auto-generated type for paginating through multiple DiscountApplications.
 */
["DiscountApplicationConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["DiscountApplicationEdge"],
	/** A list of the nodes contained in DiscountApplicationEdge. */
	nodes?:ResolverInputTypes["DiscountApplication"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one DiscountApplication and a cursor during pagination.
 */
["DiscountApplicationEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of DiscountApplicationEdge. */
	node?:ResolverInputTypes["DiscountApplication"],
		__typename?: boolean | `@${string}`
}>;
	/** The lines on the order to which the discount is applied, of the type defined by
the discount application's `targetType`. For example, the value `ENTITLED`, combined with a `targetType` of
`LINE_ITEM`, applies the discount on all line items that are entitled to the discount.
The value `ALL`, combined with a `targetType` of `SHIPPING_LINE`, applies the discount on all shipping lines.
 */
["DiscountApplicationTargetSelection"]:DiscountApplicationTargetSelection;
	/** The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards.
 */
["DiscountApplicationTargetType"]:DiscountApplicationTargetType;
	/** Discount code applications capture the intentions of a discount code at
the time that it is applied.
 */
["DiscountCodeApplication"]: AliasType<{
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** Specifies whether the discount code was applied successfully. */
	applicable?:boolean | `@${string}`,
	/** The string identifying the discount code that was used at the time of application. */
	code?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ResolverInputTypes["PricingValue"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error in the input of a mutation. */
["DisplayableError"]:AliasType<{
		/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`;
		['...on CartUserError']?: Omit<ResolverInputTypes["CartUserError"],keyof ResolverInputTypes["DisplayableError"]>;
		['...on CheckoutUserError']?: Omit<ResolverInputTypes["CheckoutUserError"],keyof ResolverInputTypes["DisplayableError"]>;
		['...on CustomerUserError']?: Omit<ResolverInputTypes["CustomerUserError"],keyof ResolverInputTypes["DisplayableError"]>;
		['...on UserError']?: Omit<ResolverInputTypes["UserError"],keyof ResolverInputTypes["DisplayableError"]>;
		__typename?: boolean | `@${string}`
}>;
	/** Represents a web address. */
["Domain"]: AliasType<{
	/** The host name of the domain (eg: `example.com`). */
	host?:boolean | `@${string}`,
	/** Whether SSL is enabled or not. */
	sslEnabled?:boolean | `@${string}`,
	/** The URL of the domain (eg: `https://example.com`). */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents a video hosted outside of Shopify. */
["ExternalVideo"]: AliasType<{
	/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** The embed URL of the video for the respective host. */
	embedUrl?:boolean | `@${string}`,
	/** The URL. */
	embeddedUrl?:boolean | `@${string}`,
	/** The host of the external video. */
	host?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The origin URL of the video on the respective host. */
	originUrl?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ResolverInputTypes["Image"],
		__typename?: boolean | `@${string}`
}>;
	/** A filter that is supported on the parent field. */
["Filter"]: AliasType<{
	/** A unique identifier. */
	id?:boolean | `@${string}`,
	/** A human-friendly string for this filter. */
	label?:boolean | `@${string}`,
	/** An enumeration that denotes the type of data this filter represents. */
	type?:boolean | `@${string}`,
	/** The list of values for this filter. */
	values?:ResolverInputTypes["FilterValue"],
		__typename?: boolean | `@${string}`
}>;
	/** The type of data that the filter group represents.

For more information, refer to [Filter products in a collection with the Storefront API]
(https://shopify.dev/custom-storefronts/products-collections/filter-products).
 */
["FilterType"]:FilterType;
	/** A selectable value within a filter. */
["FilterValue"]: AliasType<{
	/** The number of results that match this filter value. */
	count?:boolean | `@${string}`,
	/** A unique identifier. */
	id?:boolean | `@${string}`,
	/** An input object that can be used to filter by this value on the parent field.

The value is provided as a helper for building dynamic filtering UI. For example, if you have a list of selected `FilterValue` objects, you can combine their respective `input` values to use in a subsequent query.
 */
	input?:boolean | `@${string}`,
	/** A human-friendly string for this filter value. */
	label?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents a single fulfillment in an order. */
["Fulfillment"]: AliasType<{
fulfillmentLineItems?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["FulfillmentLineItemConnection"]],
	/** The name of the tracking company. */
	trackingCompany?:boolean | `@${string}`,
trackingInfo?: [{	/** Truncate the array result to this size. */
	first?: number | undefined | null},ResolverInputTypes["FulfillmentTrackingInfo"]],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a single line item in a fulfillment. There is at most one fulfillment line item for each order line item. */
["FulfillmentLineItem"]: AliasType<{
	/** The associated order's line item. */
	lineItem?:ResolverInputTypes["OrderLineItem"],
	/** The amount fulfilled in this fulfillment. */
	quantity?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple FulfillmentLineItems.
 */
["FulfillmentLineItemConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["FulfillmentLineItemEdge"],
	/** A list of the nodes contained in FulfillmentLineItemEdge. */
	nodes?:ResolverInputTypes["FulfillmentLineItem"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one FulfillmentLineItem and a cursor during pagination.
 */
["FulfillmentLineItemEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of FulfillmentLineItemEdge. */
	node?:ResolverInputTypes["FulfillmentLineItem"],
		__typename?: boolean | `@${string}`
}>;
	/** Tracking information associated with the fulfillment. */
["FulfillmentTrackingInfo"]: AliasType<{
	/** The tracking number of the fulfillment. */
	number?:boolean | `@${string}`,
	/** The URL to track the fulfillment. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The generic file resource lets you manage files in a merchant’s store. Generic files include any file that doesn’t fit into a designated type such as image or video. Example: PDF, JSON. */
["GenericFile"]: AliasType<{
	/** A word or phrase to indicate the contents of a file. */
	alt?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The MIME type of the file. */
	mimeType?:boolean | `@${string}`,
	/** The size of the original file in bytes. */
	originalFileSize?:boolean | `@${string}`,
	/** The preview image for the file. */
	previewImage?:ResolverInputTypes["Image"],
	/** The URL of the file. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields used to specify a geographical location. */
["GeoCoordinateInput"]: {
	/** The coordinate's latitude value. */
	latitude: number,
	/** The coordinate's longitude value. */
	longitude: number
};
	/** A string containing HTML code. Refer to the [HTML spec](https://html.spec.whatwg.org/#elements-3) for a
complete list of HTML elements.

Example value: `"<p>Grey cotton knit sweater.</p>"`
 */
["HTML"]:unknown;
	/** Represents information about the metafields associated to the specified resource. */
["HasMetafields"]:AliasType<{
	metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]];
		['...on Article']?: Omit<ResolverInputTypes["Article"],keyof ResolverInputTypes["HasMetafields"]>;
		['...on Blog']?: Omit<ResolverInputTypes["Blog"],keyof ResolverInputTypes["HasMetafields"]>;
		['...on Collection']?: Omit<ResolverInputTypes["Collection"],keyof ResolverInputTypes["HasMetafields"]>;
		['...on Customer']?: Omit<ResolverInputTypes["Customer"],keyof ResolverInputTypes["HasMetafields"]>;
		['...on Order']?: Omit<ResolverInputTypes["Order"],keyof ResolverInputTypes["HasMetafields"]>;
		['...on Page']?: Omit<ResolverInputTypes["Page"],keyof ResolverInputTypes["HasMetafields"]>;
		['...on Product']?: Omit<ResolverInputTypes["Product"],keyof ResolverInputTypes["HasMetafields"]>;
		['...on ProductVariant']?: Omit<ResolverInputTypes["ProductVariant"],keyof ResolverInputTypes["HasMetafields"]>;
		['...on Shop']?: Omit<ResolverInputTypes["Shop"],keyof ResolverInputTypes["HasMetafields"]>;
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to identify a metafield on an owner resource by namespace and key. */
["HasMetafieldsIdentifier"]: {
	/** A container for a set of metafields. */
	namespace: string,
	/** The identifier for the metafield. */
	key: string
};
	/** Represents an image resource. */
["Image"]: AliasType<{
	/** A word or phrase to share the nature or contents of an image. */
	altText?:boolean | `@${string}`,
	/** The original height of the image in pixels. Returns `null` if the image is not hosted by Shopify. */
	height?:boolean | `@${string}`,
	/** A unique ID for the image. */
	id?:boolean | `@${string}`,
	/** The location of the original image as a URL.

If there are any existing transformations in the original source URL, they will remain and not be stripped.
 */
	originalSrc?:boolean | `@${string}`,
	/** The location of the image as a URL. */
	src?:boolean | `@${string}`,
transformedSrc?: [{	/** Image width in pixels between 1 and 5760. */
	maxWidth?: number | undefined | null,	/** Image height in pixels between 1 and 5760. */
	maxHeight?: number | undefined | null,	/** Crops the image according to the specified region. */
	crop?: ResolverInputTypes["CropRegion"] | undefined | null,	/** Image size multiplier for high-resolution retina displays. Must be between 1 and 3. */
	scale?: number | undefined | null,	/** Best effort conversion of image into content type (SVG -> PNG, Anything -> JPG, Anything -> WEBP are supported). */
	preferredContentType?: ResolverInputTypes["ImageContentType"] | undefined | null},boolean | `@${string}`],
url?: [{	/** A set of options to transform the original image. */
	transform?: ResolverInputTypes["ImageTransformInput"] | undefined | null},boolean | `@${string}`],
	/** The original width of the image in pixels. Returns `null` if the image is not hosted by Shopify. */
	width?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Images.
 */
["ImageConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["ImageEdge"],
	/** A list of the nodes contained in ImageEdge. */
	nodes?:ResolverInputTypes["Image"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** List of supported image content types. */
["ImageContentType"]:ImageContentType;
	/** An auto-generated type which holds one Image and a cursor during pagination.
 */
["ImageEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of ImageEdge. */
	node?:ResolverInputTypes["Image"],
		__typename?: boolean | `@${string}`
}>;
	/** The available options for transforming an image.

All transformation options are considered best effort. Any transformation that the original image type doesn't support will be ignored.
 */
["ImageTransformInput"]: {
	/** The region of the image to remain after cropping.
Must be used in conjunction with the `maxWidth` and/or `maxHeight` fields, where the `maxWidth` and `maxHeight` aren't equal.
The `crop` argument should coincide with the smaller value. A smaller `maxWidth` indicates a `LEFT` or `RIGHT` crop, while
a smaller `maxHeight` indicates a `TOP` or `BOTTOM` crop. For example, `{ maxWidth: 5, maxHeight: 10, crop: LEFT }` will result
in an image with a width of 5 and height of 10, where the right side of the image is removed.
 */
	crop?: ResolverInputTypes["CropRegion"] | undefined | null,
	/** Image width in pixels between 1 and 5760.
 */
	maxWidth?: number | undefined | null,
	/** Image height in pixels between 1 and 5760.
 */
	maxHeight?: number | undefined | null,
	/** Image size multiplier for high-resolution retina displays. Must be within 1..3.
 */
	scale?: number | undefined | null,
	/** Convert the source image into the preferred content type.
Supported conversions: `.svg` to `.png`, any file type to `.jpg`, and any file type to `.webp`.
 */
	preferredContentType?: ResolverInputTypes["ImageContentType"] | undefined | null
};
	/** A [JSON](https://www.json.org/json-en.html) object.

Example value:
`{
  "product": {
    "id": "gid://shopify/Product/1346443542550",
    "title": "White T-shirt",
    "options": [{
      "name": "Size",
      "values": ["M", "L"]
    }]
  }
}`
 */
["JSON"]:unknown;
	/** A language. */
["Language"]: AliasType<{
	/** The name of the language in the language itself. If the language uses capitalization, it is capitalized for a mid-sentence position. */
	endonymName?:boolean | `@${string}`,
	/** The ISO code. */
	isoCode?:boolean | `@${string}`,
	/** The name of the language in the current language. */
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** ISO 639-1 language codes supported by Shopify. */
["LanguageCode"]:LanguageCode;
	/** Information about the localized experiences configured for the shop. */
["Localization"]: AliasType<{
	/** The list of countries with enabled localized experiences. */
	availableCountries?:ResolverInputTypes["Country"],
	/** The list of languages available for the active country. */
	availableLanguages?:ResolverInputTypes["Language"],
	/** The country of the active localized experience. Use the `@inContext` directive to change this value. */
	country?:ResolverInputTypes["Country"],
	/** The language of the active localized experience. Use the `@inContext` directive to change this value. */
	language?:ResolverInputTypes["Language"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a location where product inventory is held. */
["Location"]: AliasType<{
	/** The address of the location. */
	address?:ResolverInputTypes["LocationAddress"],
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The name of the location. */
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents the address of a location.
 */
["LocationAddress"]: AliasType<{
	/** The first line of the address for the location. */
	address1?:boolean | `@${string}`,
	/** The second line of the address for the location. */
	address2?:boolean | `@${string}`,
	/** The city of the location. */
	city?:boolean | `@${string}`,
	/** The country of the location. */
	country?:boolean | `@${string}`,
	/** The country code of the location. */
	countryCode?:boolean | `@${string}`,
	/** A formatted version of the address for the location. */
	formatted?:boolean | `@${string}`,
	/** The latitude coordinates of the location. */
	latitude?:boolean | `@${string}`,
	/** The longitude coordinates of the location. */
	longitude?:boolean | `@${string}`,
	/** The phone number of the location. */
	phone?:boolean | `@${string}`,
	/** The province of the location. */
	province?:boolean | `@${string}`,
	/** The code for the province, state, or district of the address of the location.
 */
	provinceCode?:boolean | `@${string}`,
	/** The ZIP code of the location. */
	zip?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Locations.
 */
["LocationConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["LocationEdge"],
	/** A list of the nodes contained in LocationEdge. */
	nodes?:ResolverInputTypes["Location"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Location and a cursor during pagination.
 */
["LocationEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of LocationEdge. */
	node?:ResolverInputTypes["Location"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Location query. */
["LocationSortKeys"]:LocationSortKeys;
	/** Represents a mailing address for customers and shipping. */
["MailingAddress"]: AliasType<{
	/** The first line of the address. Typically the street address or PO Box number. */
	address1?:boolean | `@${string}`,
	/** The second line of the address. Typically the number of the apartment, suite, or unit.
 */
	address2?:boolean | `@${string}`,
	/** The name of the city, district, village, or town.
 */
	city?:boolean | `@${string}`,
	/** The name of the customer's company or organization.
 */
	company?:boolean | `@${string}`,
	/** The name of the country.
 */
	country?:boolean | `@${string}`,
	/** The two-letter code for the country of the address.

For example, US.
 */
	countryCode?:boolean | `@${string}`,
	/** The two-letter code for the country of the address.

For example, US.
 */
	countryCodeV2?:boolean | `@${string}`,
	/** The first name of the customer. */
	firstName?:boolean | `@${string}`,
formatted?: [{	/** Whether to include the customer's name in the formatted address. */
	withName?: boolean | undefined | null,	/** Whether to include the customer's company in the formatted address. */
	withCompany?: boolean | undefined | null},boolean | `@${string}`],
	/** A comma-separated list of the values for city, province, and country. */
	formattedArea?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The last name of the customer. */
	lastName?:boolean | `@${string}`,
	/** The latitude coordinate of the customer address. */
	latitude?:boolean | `@${string}`,
	/** The longitude coordinate of the customer address. */
	longitude?:boolean | `@${string}`,
	/** The full name of the customer, based on firstName and lastName.
 */
	name?:boolean | `@${string}`,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?:boolean | `@${string}`,
	/** The region of the address, such as the province, state, or district. */
	province?:boolean | `@${string}`,
	/** The two-letter code for the region.

For example, ON.
 */
	provinceCode?:boolean | `@${string}`,
	/** The zip or postal code of the address. */
	zip?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple MailingAddresses.
 */
["MailingAddressConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["MailingAddressEdge"],
	/** A list of the nodes contained in MailingAddressEdge. */
	nodes?:ResolverInputTypes["MailingAddress"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one MailingAddress and a cursor during pagination.
 */
["MailingAddressEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of MailingAddressEdge. */
	node?:ResolverInputTypes["MailingAddress"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields to create or update a mailing address. */
["MailingAddressInput"]: {
	/** The first line of the address. Typically the street address or PO Box number.
 */
	address1?: string | undefined | null,
	/** The second line of the address. Typically the number of the apartment, suite, or unit.
 */
	address2?: string | undefined | null,
	/** The name of the city, district, village, or town.
 */
	city?: string | undefined | null,
	/** The name of the customer's company or organization.
 */
	company?: string | undefined | null,
	/** The name of the country. */
	country?: string | undefined | null,
	/** The first name of the customer. */
	firstName?: string | undefined | null,
	/** The last name of the customer. */
	lastName?: string | undefined | null,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined | null,
	/** The region of the address, such as the province, state, or district. */
	province?: string | undefined | null,
	/** The zip or postal code of the address. */
	zip?: string | undefined | null
};
	/** Manual discount applications capture the intentions of a discount that was manually created.
 */
["ManualDiscountApplication"]: AliasType<{
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** The description of the application. */
	description?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The title of the application. */
	title?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ResolverInputTypes["PricingValue"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a media interface. */
["Media"]:AliasType<{
		/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ResolverInputTypes["Image"];
		['...on ExternalVideo']?: Omit<ResolverInputTypes["ExternalVideo"],keyof ResolverInputTypes["Media"]>;
		['...on MediaImage']?: Omit<ResolverInputTypes["MediaImage"],keyof ResolverInputTypes["Media"]>;
		['...on Model3d']?: Omit<ResolverInputTypes["Model3d"],keyof ResolverInputTypes["Media"]>;
		['...on Video']?: Omit<ResolverInputTypes["Video"],keyof ResolverInputTypes["Media"]>;
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Media.
 */
["MediaConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["MediaEdge"],
	/** A list of the nodes contained in MediaEdge. */
	nodes?:ResolverInputTypes["Media"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** The possible content types for a media object. */
["MediaContentType"]:MediaContentType;
	/** An auto-generated type which holds one Media and a cursor during pagination.
 */
["MediaEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of MediaEdge. */
	node?:ResolverInputTypes["Media"],
		__typename?: boolean | `@${string}`
}>;
	/** Host for a Media Resource. */
["MediaHost"]:MediaHost;
	/** Represents a Shopify hosted image. */
["MediaImage"]: AliasType<{
	/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The image for the media. */
	image?:ResolverInputTypes["Image"],
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ResolverInputTypes["Image"],
		__typename?: boolean | `@${string}`
}>;
	/** A [navigation menu](https://help.shopify.com/manual/online-store/menus-and-links) representing a hierarchy
of hyperlinks (items).
 */
["Menu"]: AliasType<{
	/** The menu's handle. */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The menu's child items. */
	items?:ResolverInputTypes["MenuItem"],
	/** The count of items on the menu. */
	itemsCount?:boolean | `@${string}`,
	/** The menu's title. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A menu item within a parent menu.
 */
["MenuItem"]: AliasType<{
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The menu item's child items. */
	items?:ResolverInputTypes["MenuItem"],
	/** The ID of the linked resource. */
	resourceId?:boolean | `@${string}`,
	/** The menu item's tags to filter a collection. */
	tags?:boolean | `@${string}`,
	/** The menu item's title. */
	title?:boolean | `@${string}`,
	/** The menu item's type. */
	type?:boolean | `@${string}`,
	/** The menu item's URL. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A menu item type. */
["MenuItemType"]:MenuItemType;
	/** The merchandise to be purchased at checkout. */
["Merchandise"]: AliasType<{
	ProductVariant?:ResolverInputTypes["ProductVariant"],
		__typename?: boolean | `@${string}`
}>;
	/** Metafields represent custom metadata attached to a resource. Metafields can be sorted into namespaces and are
comprised of keys, values, and value types.
 */
["Metafield"]: AliasType<{
	/** The date and time when the storefront metafield was created. */
	createdAt?:boolean | `@${string}`,
	/** The description of a metafield. */
	description?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The unique identifier for the metafield within its namespace. */
	key?:boolean | `@${string}`,
	/** The container for a group of metafields that the metafield is associated with. */
	namespace?:boolean | `@${string}`,
	/** The type of resource that the metafield is attached to. */
	parentResource?:ResolverInputTypes["MetafieldParentResource"],
	/** Returns a reference object if the metafield's type is a resource reference. */
	reference?:ResolverInputTypes["MetafieldReference"],
references?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null},ResolverInputTypes["MetafieldReferenceConnection"]],
	/** The type name of the metafield.
Refer to the list of [supported types](https://shopify.dev/apps/metafields/definitions/types).
 */
	type?:boolean | `@${string}`,
	/** The date and time when the metafield was last updated. */
	updatedAt?:boolean | `@${string}`,
	/** The data stored in the metafield. Always stored as a string, regardless of the metafield's type. */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A filter used to view a subset of products in a collection matching a specific metafield value.

Only the following metafield types are currently supported:
- `number_integer`
- `number_decimal`
- `single_line_text_field`
- `boolean` as of 2022-04.
 */
["MetafieldFilter"]: {
	/** The namespace of the metafield to filter on. */
	namespace: string,
	/** The key of the metafield to filter on. */
	key: string,
	/** The value of the metafield. */
	value: string
};
	/** A resource that the metafield belongs to. */
["MetafieldParentResource"]: AliasType<{
	Article?:ResolverInputTypes["Article"],
	Blog?:ResolverInputTypes["Blog"],
	Collection?:ResolverInputTypes["Collection"],
	Customer?:ResolverInputTypes["Customer"],
	Order?:ResolverInputTypes["Order"],
	Page?:ResolverInputTypes["Page"],
	Product?:ResolverInputTypes["Product"],
	ProductVariant?:ResolverInputTypes["ProductVariant"],
	Shop?:ResolverInputTypes["Shop"],
		__typename?: boolean | `@${string}`
}>;
	/** Returns the resource which is being referred to by a metafield.
 */
["MetafieldReference"]: AliasType<{
	Collection?:ResolverInputTypes["Collection"],
	GenericFile?:ResolverInputTypes["GenericFile"],
	MediaImage?:ResolverInputTypes["MediaImage"],
	Metaobject?:ResolverInputTypes["Metaobject"],
	Page?:ResolverInputTypes["Page"],
	Product?:ResolverInputTypes["Product"],
	ProductVariant?:ResolverInputTypes["ProductVariant"],
	Video?:ResolverInputTypes["Video"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple MetafieldReferences.
 */
["MetafieldReferenceConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["MetafieldReferenceEdge"],
	/** A list of the nodes contained in MetafieldReferenceEdge. */
	nodes?:ResolverInputTypes["MetafieldReference"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one MetafieldReference and a cursor during pagination.
 */
["MetafieldReferenceEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of MetafieldReferenceEdge. */
	node?:ResolverInputTypes["MetafieldReference"],
		__typename?: boolean | `@${string}`
}>;
	/** An instance of a user-defined model based on a MetaobjectDefinition. */
["Metaobject"]: AliasType<{
field?: [{	/** The key of the field. */
	key: string},ResolverInputTypes["MetaobjectField"]],
	/** All object fields with defined values.
Omitted object keys can be assumed null, and no guarantees are made about field order.
 */
	fields?:ResolverInputTypes["MetaobjectField"],
	/** The unique handle of the metaobject. Useful as a custom ID. */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The type of the metaobject. Defines the namespace of its associated metafields. */
	type?:boolean | `@${string}`,
	/** The date and time when the metaobject was last updated. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Metaobjects.
 */
["MetaobjectConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["MetaobjectEdge"],
	/** A list of the nodes contained in MetaobjectEdge. */
	nodes?:ResolverInputTypes["Metaobject"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Metaobject and a cursor during pagination.
 */
["MetaobjectEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of MetaobjectEdge. */
	node?:ResolverInputTypes["Metaobject"],
		__typename?: boolean | `@${string}`
}>;
	/** Provides the value of a Metaobject field. */
["MetaobjectField"]: AliasType<{
	/** The field key. */
	key?:boolean | `@${string}`,
	/** A referenced object if the field type is a resource reference. */
	reference?:ResolverInputTypes["MetafieldReference"],
references?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null},ResolverInputTypes["MetafieldReferenceConnection"]],
	/** The type name of the field.
See the list of [supported types](https://shopify.dev/apps/metafields/definitions/types).
 */
	type?:boolean | `@${string}`,
	/** The field value. */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields used to retrieve a metaobject by handle. */
["MetaobjectHandleInput"]: {
	/** The handle of the metaobject. */
	handle: string,
	/** The type of the metaobject. */
	type: string
};
	/** Represents a Shopify hosted 3D model. */
["Model3d"]: AliasType<{
	/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ResolverInputTypes["Image"],
	/** The sources for a 3d model. */
	sources?:ResolverInputTypes["Model3dSource"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a source for a Shopify hosted 3d model. */
["Model3dSource"]: AliasType<{
	/** The filesize of the 3d model. */
	filesize?:boolean | `@${string}`,
	/** The format of the 3d model. */
	format?:boolean | `@${string}`,
	/** The MIME type of the 3d model. */
	mimeType?:boolean | `@${string}`,
	/** The URL of the 3d model. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for a monetary value with currency. */
["MoneyInput"]: {
	/** Decimal money amount. */
	amount: ResolverInputTypes["Decimal"],
	/** Currency of the money. */
	currencyCode: ResolverInputTypes["CurrencyCode"]
};
	/** A monetary value with currency.
 */
["MoneyV2"]: AliasType<{
	/** Decimal money amount. */
	amount?:boolean | `@${string}`,
	/** Currency of the money. */
	currencyCode?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
["Mutation"]: AliasType<{
cartAttributesUpdate?: [{	/** An array of key-value pairs that contains additional information about the cart. */
	attributes: Array<ResolverInputTypes["AttributeInput"]>,	/** The ID of the cart. */
	cartId: string},ResolverInputTypes["CartAttributesUpdatePayload"]],
cartBuyerIdentityUpdate?: [{	/** The ID of the cart. */
	cartId: string,	/** The customer associated with the cart. Used to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
Buyer identity should match the customer's shipping address.
 */
	buyerIdentity: ResolverInputTypes["CartBuyerIdentityInput"]},ResolverInputTypes["CartBuyerIdentityUpdatePayload"]],
cartCreate?: [{	/** The fields used to create a cart. */
	input?: ResolverInputTypes["CartInput"] | undefined | null},ResolverInputTypes["CartCreatePayload"]],
cartDiscountCodesUpdate?: [{	/** The ID of the cart. */
	cartId: string,	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes?: Array<string> | undefined | null},ResolverInputTypes["CartDiscountCodesUpdatePayload"]],
cartLinesAdd?: [{	/** A list of merchandise lines to add to the cart. */
	lines: Array<ResolverInputTypes["CartLineInput"]>,	/** The ID of the cart. */
	cartId: string},ResolverInputTypes["CartLinesAddPayload"]],
cartLinesRemove?: [{	/** The ID of the cart. */
	cartId: string,	/** The merchandise line IDs to remove. */
	lineIds: Array<string>},ResolverInputTypes["CartLinesRemovePayload"]],
cartLinesUpdate?: [{	/** The ID of the cart. */
	cartId: string,	/** The merchandise lines to update. */
	lines: Array<ResolverInputTypes["CartLineUpdateInput"]>},ResolverInputTypes["CartLinesUpdatePayload"]],
cartNoteUpdate?: [{	/** The ID of the cart. */
	cartId: string,	/** The note on the cart. */
	note?: string | undefined | null},ResolverInputTypes["CartNoteUpdatePayload"]],
cartSelectedDeliveryOptionsUpdate?: [{	/** The ID of the cart. */
	cartId: string,	/** The selected delivery options. */
	selectedDeliveryOptions: Array<ResolverInputTypes["CartSelectedDeliveryOptionInput"]>},ResolverInputTypes["CartSelectedDeliveryOptionsUpdatePayload"]],
checkoutAttributesUpdateV2?: [{	/** The ID of the checkout. */
	checkoutId: string,	/** The checkout attributes to update. */
	input: ResolverInputTypes["CheckoutAttributesUpdateV2Input"]},ResolverInputTypes["CheckoutAttributesUpdateV2Payload"]],
checkoutCompleteFree?: [{	/** The ID of the checkout. */
	checkoutId: string},ResolverInputTypes["CheckoutCompleteFreePayload"]],
checkoutCompleteWithCreditCardV2?: [{	/** The ID of the checkout. */
	checkoutId: string,	/** The credit card info to apply as a payment. */
	payment: ResolverInputTypes["CreditCardPaymentInputV2"]},ResolverInputTypes["CheckoutCompleteWithCreditCardV2Payload"]],
checkoutCompleteWithTokenizedPaymentV3?: [{	/** The ID of the checkout. */
	checkoutId: string,	/** The info to apply as a tokenized payment. */
	payment: ResolverInputTypes["TokenizedPaymentInputV3"]},ResolverInputTypes["CheckoutCompleteWithTokenizedPaymentV3Payload"]],
checkoutCreate?: [{	/** The fields used to create a checkout. */
	input: ResolverInputTypes["CheckoutCreateInput"],	/** The checkout queue token. Available only to selected stores. */
	queueToken?: string | undefined | null},ResolverInputTypes["CheckoutCreatePayload"]],
checkoutCustomerAssociateV2?: [{	/** The ID of the checkout. */
	checkoutId: string,	/** The customer access token of the customer to associate. */
	customerAccessToken: string},ResolverInputTypes["CheckoutCustomerAssociateV2Payload"]],
checkoutCustomerDisassociateV2?: [{	/** The ID of the checkout. */
	checkoutId: string},ResolverInputTypes["CheckoutCustomerDisassociateV2Payload"]],
checkoutDiscountCodeApplyV2?: [{	/** The discount code to apply to the checkout. */
	discountCode: string,	/** The ID of the checkout. */
	checkoutId: string},ResolverInputTypes["CheckoutDiscountCodeApplyV2Payload"]],
checkoutDiscountCodeRemove?: [{	/** The ID of the checkout. */
	checkoutId: string},ResolverInputTypes["CheckoutDiscountCodeRemovePayload"]],
checkoutEmailUpdateV2?: [{	/** The ID of the checkout. */
	checkoutId: string,	/** The email to update the checkout with. */
	email: string},ResolverInputTypes["CheckoutEmailUpdateV2Payload"]],
checkoutGiftCardRemoveV2?: [{	/** The ID of the Applied Gift Card to remove from the Checkout. */
	appliedGiftCardId: string,	/** The ID of the checkout. */
	checkoutId: string},ResolverInputTypes["CheckoutGiftCardRemoveV2Payload"]],
checkoutGiftCardsAppend?: [{	/** A list of gift card codes to append to the checkout. */
	giftCardCodes: Array<string>,	/** The ID of the checkout. */
	checkoutId: string},ResolverInputTypes["CheckoutGiftCardsAppendPayload"]],
checkoutLineItemsAdd?: [{	/** A list of line item objects to add to the checkout. */
	lineItems: Array<ResolverInputTypes["CheckoutLineItemInput"]>,	/** The ID of the checkout. */
	checkoutId: string},ResolverInputTypes["CheckoutLineItemsAddPayload"]],
checkoutLineItemsRemove?: [{	/** The checkout on which to remove line items. */
	checkoutId: string,	/** Line item ids to remove. */
	lineItemIds: Array<string>},ResolverInputTypes["CheckoutLineItemsRemovePayload"]],
checkoutLineItemsReplace?: [{	/** A list of line item objects to set on the checkout. */
	lineItems: Array<ResolverInputTypes["CheckoutLineItemInput"]>,	/** The ID of the checkout. */
	checkoutId: string},ResolverInputTypes["CheckoutLineItemsReplacePayload"]],
checkoutLineItemsUpdate?: [{	/** The checkout on which to update line items. */
	checkoutId: string,	/** Line items to update. */
	lineItems: Array<ResolverInputTypes["CheckoutLineItemUpdateInput"]>},ResolverInputTypes["CheckoutLineItemsUpdatePayload"]],
checkoutShippingAddressUpdateV2?: [{	/** The shipping address to where the line items will be shipped. */
	shippingAddress: ResolverInputTypes["MailingAddressInput"],	/** The ID of the checkout. */
	checkoutId: string},ResolverInputTypes["CheckoutShippingAddressUpdateV2Payload"]],
checkoutShippingLineUpdate?: [{	/** The ID of the checkout. */
	checkoutId: string,	/** A unique identifier to a Checkout’s shipping provider, price, and title combination, enabling the customer to select the availableShippingRates. */
	shippingRateHandle: string},ResolverInputTypes["CheckoutShippingLineUpdatePayload"]],
customerAccessTokenCreate?: [{	/** The fields used to create a customer access token. */
	input: ResolverInputTypes["CustomerAccessTokenCreateInput"]},ResolverInputTypes["CustomerAccessTokenCreatePayload"]],
customerAccessTokenCreateWithMultipass?: [{	/** A valid [multipass token](https://shopify.dev/api/multipass) to be authenticated. */
	multipassToken: string},ResolverInputTypes["CustomerAccessTokenCreateWithMultipassPayload"]],
customerAccessTokenDelete?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string},ResolverInputTypes["CustomerAccessTokenDeletePayload"]],
customerAccessTokenRenew?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string},ResolverInputTypes["CustomerAccessTokenRenewPayload"]],
customerActivate?: [{	/** Specifies the customer to activate. */
	id: string,	/** The fields used to activate a customer. */
	input: ResolverInputTypes["CustomerActivateInput"]},ResolverInputTypes["CustomerActivatePayload"]],
customerActivateByUrl?: [{	/** The customer activation URL. */
	activationUrl: ResolverInputTypes["URL"],	/** A new password set during activation. */
	password: string},ResolverInputTypes["CustomerActivateByUrlPayload"]],
customerAddressCreate?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string,	/** The customer mailing address to create. */
	address: ResolverInputTypes["MailingAddressInput"]},ResolverInputTypes["CustomerAddressCreatePayload"]],
customerAddressDelete?: [{	/** Specifies the address to delete. */
	id: string,	/** The access token used to identify the customer. */
	customerAccessToken: string},ResolverInputTypes["CustomerAddressDeletePayload"]],
customerAddressUpdate?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string,	/** Specifies the customer address to update. */
	id: string,	/** The customer’s mailing address. */
	address: ResolverInputTypes["MailingAddressInput"]},ResolverInputTypes["CustomerAddressUpdatePayload"]],
customerCreate?: [{	/** The fields used to create a new customer. */
	input: ResolverInputTypes["CustomerCreateInput"]},ResolverInputTypes["CustomerCreatePayload"]],
customerDefaultAddressUpdate?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string,	/** ID of the address to set as the new default for the customer. */
	addressId: string},ResolverInputTypes["CustomerDefaultAddressUpdatePayload"]],
customerRecover?: [{	/** The email address of the customer to recover. */
	email: string},ResolverInputTypes["CustomerRecoverPayload"]],
customerReset?: [{	/** Specifies the customer to reset. */
	id: string,	/** The fields used to reset a customer’s password. */
	input: ResolverInputTypes["CustomerResetInput"]},ResolverInputTypes["CustomerResetPayload"]],
customerResetByUrl?: [{	/** The customer's reset password url. */
	resetUrl: ResolverInputTypes["URL"],	/** New password that will be set as part of the reset password process. */
	password: string},ResolverInputTypes["CustomerResetByUrlPayload"]],
customerUpdate?: [{	/** The access token used to identify the customer. */
	customerAccessToken: string,	/** The customer object input. */
	customer: ResolverInputTypes["CustomerUpdateInput"]},ResolverInputTypes["CustomerUpdatePayload"]],
		__typename?: boolean | `@${string}`
}>;
	/** An object with an ID field to support global identification, in accordance with the
[Relay specification](https://relay.dev/graphql/objectidentification.htm#sec-Node-Interface).
This interface is used by the [node](https://shopify.dev/api/admin-graphql/unstable/queries/node)
and [nodes](https://shopify.dev/api/admin-graphql/unstable/queries/nodes) queries.
 */
["Node"]:AliasType<{
		/** A globally-unique ID. */
	id?:boolean | `@${string}`;
		['...on AppliedGiftCard']?: Omit<ResolverInputTypes["AppliedGiftCard"],keyof ResolverInputTypes["Node"]>;
		['...on Article']?: Omit<ResolverInputTypes["Article"],keyof ResolverInputTypes["Node"]>;
		['...on Blog']?: Omit<ResolverInputTypes["Blog"],keyof ResolverInputTypes["Node"]>;
		['...on Cart']?: Omit<ResolverInputTypes["Cart"],keyof ResolverInputTypes["Node"]>;
		['...on CartLine']?: Omit<ResolverInputTypes["CartLine"],keyof ResolverInputTypes["Node"]>;
		['...on Checkout']?: Omit<ResolverInputTypes["Checkout"],keyof ResolverInputTypes["Node"]>;
		['...on CheckoutLineItem']?: Omit<ResolverInputTypes["CheckoutLineItem"],keyof ResolverInputTypes["Node"]>;
		['...on Collection']?: Omit<ResolverInputTypes["Collection"],keyof ResolverInputTypes["Node"]>;
		['...on Comment']?: Omit<ResolverInputTypes["Comment"],keyof ResolverInputTypes["Node"]>;
		['...on ExternalVideo']?: Omit<ResolverInputTypes["ExternalVideo"],keyof ResolverInputTypes["Node"]>;
		['...on GenericFile']?: Omit<ResolverInputTypes["GenericFile"],keyof ResolverInputTypes["Node"]>;
		['...on Location']?: Omit<ResolverInputTypes["Location"],keyof ResolverInputTypes["Node"]>;
		['...on MailingAddress']?: Omit<ResolverInputTypes["MailingAddress"],keyof ResolverInputTypes["Node"]>;
		['...on MediaImage']?: Omit<ResolverInputTypes["MediaImage"],keyof ResolverInputTypes["Node"]>;
		['...on Menu']?: Omit<ResolverInputTypes["Menu"],keyof ResolverInputTypes["Node"]>;
		['...on MenuItem']?: Omit<ResolverInputTypes["MenuItem"],keyof ResolverInputTypes["Node"]>;
		['...on Metafield']?: Omit<ResolverInputTypes["Metafield"],keyof ResolverInputTypes["Node"]>;
		['...on Metaobject']?: Omit<ResolverInputTypes["Metaobject"],keyof ResolverInputTypes["Node"]>;
		['...on Model3d']?: Omit<ResolverInputTypes["Model3d"],keyof ResolverInputTypes["Node"]>;
		['...on Order']?: Omit<ResolverInputTypes["Order"],keyof ResolverInputTypes["Node"]>;
		['...on Page']?: Omit<ResolverInputTypes["Page"],keyof ResolverInputTypes["Node"]>;
		['...on Payment']?: Omit<ResolverInputTypes["Payment"],keyof ResolverInputTypes["Node"]>;
		['...on Product']?: Omit<ResolverInputTypes["Product"],keyof ResolverInputTypes["Node"]>;
		['...on ProductOption']?: Omit<ResolverInputTypes["ProductOption"],keyof ResolverInputTypes["Node"]>;
		['...on ProductVariant']?: Omit<ResolverInputTypes["ProductVariant"],keyof ResolverInputTypes["Node"]>;
		['...on Shop']?: Omit<ResolverInputTypes["Shop"],keyof ResolverInputTypes["Node"]>;
		['...on ShopPolicy']?: Omit<ResolverInputTypes["ShopPolicy"],keyof ResolverInputTypes["Node"]>;
		['...on UrlRedirect']?: Omit<ResolverInputTypes["UrlRedirect"],keyof ResolverInputTypes["Node"]>;
		['...on Video']?: Omit<ResolverInputTypes["Video"],keyof ResolverInputTypes["Node"]>;
		__typename?: boolean | `@${string}`
}>;
	/** Represents a resource that can be published to the Online Store sales channel. */
["OnlineStorePublishable"]:AliasType<{
		/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`;
		['...on Article']?: Omit<ResolverInputTypes["Article"],keyof ResolverInputTypes["OnlineStorePublishable"]>;
		['...on Blog']?: Omit<ResolverInputTypes["Blog"],keyof ResolverInputTypes["OnlineStorePublishable"]>;
		['...on Collection']?: Omit<ResolverInputTypes["Collection"],keyof ResolverInputTypes["OnlineStorePublishable"]>;
		['...on Page']?: Omit<ResolverInputTypes["Page"],keyof ResolverInputTypes["OnlineStorePublishable"]>;
		['...on Product']?: Omit<ResolverInputTypes["Product"],keyof ResolverInputTypes["OnlineStorePublishable"]>;
		__typename?: boolean | `@${string}`
}>;
	/** An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process, during which time they provides an email address, billing address and payment information. */
["Order"]: AliasType<{
	/** The reason for the order's cancellation. Returns `null` if the order wasn't canceled. */
	cancelReason?:boolean | `@${string}`,
	/** The date and time when the order was canceled. Returns null if the order wasn't canceled. */
	canceledAt?:boolean | `@${string}`,
	/** The code of the currency used for the payment. */
	currencyCode?:boolean | `@${string}`,
	/** The subtotal of line items and their discounts, excluding line items that have been removed. Does not contain order-level discounts, duties, shipping costs, or shipping discounts. Taxes are not included unless the order is a taxes-included order. */
	currentSubtotalPrice?:ResolverInputTypes["MoneyV2"],
	/** The total cost of duties for the order, including refunds. */
	currentTotalDuties?:ResolverInputTypes["MoneyV2"],
	/** The total amount of the order, including duties, taxes and discounts, minus amounts for line items that have been removed. */
	currentTotalPrice?:ResolverInputTypes["MoneyV2"],
	/** The total of all taxes applied to the order, excluding taxes for returned line items. */
	currentTotalTax?:ResolverInputTypes["MoneyV2"],
	/** A list of the custom attributes added to the order. */
	customAttributes?:ResolverInputTypes["Attribute"],
	/** The locale code in which this specific order happened. */
	customerLocale?:boolean | `@${string}`,
	/** The unique URL that the customer can use to access the order. */
	customerUrl?:boolean | `@${string}`,
discountApplications?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["DiscountApplicationConnection"]],
	/** Whether the order has had any edits applied or not. */
	edited?:boolean | `@${string}`,
	/** The customer's email address. */
	email?:boolean | `@${string}`,
	/** The financial status of the order. */
	financialStatus?:boolean | `@${string}`,
	/** The fulfillment status for the order. */
	fulfillmentStatus?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
lineItems?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["OrderLineItemConnection"]],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]],
	/** Unique identifier for the order that appears on the order.
For example, _#1000_ or _Store1001.
 */
	name?:boolean | `@${string}`,
	/** A unique numeric identifier for the order for use by shop owner and customer. */
	orderNumber?:boolean | `@${string}`,
	/** The total cost of duties charged at checkout. */
	originalTotalDuties?:ResolverInputTypes["MoneyV2"],
	/** The total price of the order before any applied edits. */
	originalTotalPrice?:ResolverInputTypes["MoneyV2"],
	/** The customer's phone number for receiving SMS notifications. */
	phone?:boolean | `@${string}`,
	/** The date and time when the order was imported.
This value can be set to dates in the past when importing from other systems.
If no value is provided, it will be auto-generated based on current date and time.
 */
	processedAt?:boolean | `@${string}`,
	/** The address to where the order will be shipped. */
	shippingAddress?:ResolverInputTypes["MailingAddress"],
	/** The discounts that have been allocated onto the shipping line by discount applications.
 */
	shippingDiscountAllocations?:ResolverInputTypes["DiscountAllocation"],
	/** The unique URL for the order's status page. */
	statusUrl?:boolean | `@${string}`,
	/** Price of the order before shipping and taxes. */
	subtotalPrice?:ResolverInputTypes["MoneyV2"],
	/** Price of the order before duties, shipping and taxes. */
	subtotalPriceV2?:ResolverInputTypes["MoneyV2"],
successfulFulfillments?: [{	/** Truncate the array result to this size. */
	first?: number | undefined | null},ResolverInputTypes["Fulfillment"]],
	/** The sum of all the prices of all the items in the order, duties, taxes and discounts included (must be positive). */
	totalPrice?:ResolverInputTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the order, duties, taxes and discounts included (must be positive). */
	totalPriceV2?:ResolverInputTypes["MoneyV2"],
	/** The total amount that has been refunded. */
	totalRefunded?:ResolverInputTypes["MoneyV2"],
	/** The total amount that has been refunded. */
	totalRefundedV2?:ResolverInputTypes["MoneyV2"],
	/** The total cost of shipping. */
	totalShippingPrice?:ResolverInputTypes["MoneyV2"],
	/** The total cost of shipping. */
	totalShippingPriceV2?:ResolverInputTypes["MoneyV2"],
	/** The total cost of taxes. */
	totalTax?:ResolverInputTypes["MoneyV2"],
	/** The total cost of taxes. */
	totalTaxV2?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents the reason for the order's cancellation. */
["OrderCancelReason"]:OrderCancelReason;
	/** An auto-generated type for paginating through multiple Orders.
 */
["OrderConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["OrderEdge"],
	/** A list of the nodes contained in OrderEdge. */
	nodes?:ResolverInputTypes["Order"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
	/** The total count of Orders. */
	totalCount?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Order and a cursor during pagination.
 */
["OrderEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of OrderEdge. */
	node?:ResolverInputTypes["Order"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents the order's current financial status. */
["OrderFinancialStatus"]:OrderFinancialStatus;
	/** Represents the order's aggregated fulfillment status for display purposes. */
["OrderFulfillmentStatus"]:OrderFulfillmentStatus;
	/** Represents a single line in an order. There is one line item for each distinct product variant. */
["OrderLineItem"]: AliasType<{
	/** The number of entries associated to the line item minus the items that have been removed. */
	currentQuantity?:boolean | `@${string}`,
	/** List of custom attributes associated to the line item. */
	customAttributes?:ResolverInputTypes["Attribute"],
	/** The discounts that have been allocated onto the order line item by discount applications. */
	discountAllocations?:ResolverInputTypes["DiscountAllocation"],
	/** The total price of the line item, including discounts, and displayed in the presentment currency. */
	discountedTotalPrice?:ResolverInputTypes["MoneyV2"],
	/** The total price of the line item, not including any discounts. The total price is calculated using the original unit price multiplied by the quantity, and it is displayed in the presentment currency. */
	originalTotalPrice?:ResolverInputTypes["MoneyV2"],
	/** The number of products variants associated to the line item. */
	quantity?:boolean | `@${string}`,
	/** The title of the product combined with title of the variant. */
	title?:boolean | `@${string}`,
	/** The product variant object associated to the line item. */
	variant?:ResolverInputTypes["ProductVariant"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple OrderLineItems.
 */
["OrderLineItemConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["OrderLineItemEdge"],
	/** A list of the nodes contained in OrderLineItemEdge. */
	nodes?:ResolverInputTypes["OrderLineItem"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one OrderLineItem and a cursor during pagination.
 */
["OrderLineItemEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of OrderLineItemEdge. */
	node?:ResolverInputTypes["OrderLineItem"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Order query. */
["OrderSortKeys"]:OrderSortKeys;
	/** Shopify merchants can create pages to hold static HTML content. Each Page object represents a custom page on the online store. */
["Page"]: AliasType<{
	/** The description of the page, complete with HTML formatting. */
	body?:boolean | `@${string}`,
	/** Summary of the page body. */
	bodySummary?:boolean | `@${string}`,
	/** The timestamp of the page creation. */
	createdAt?:boolean | `@${string}`,
	/** A human-friendly unique string for the page automatically generated from its title. */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
	/** The page's SEO information. */
	seo?:ResolverInputTypes["SEO"],
	/** The title of the page. */
	title?:boolean | `@${string}`,
	/** The timestamp of the latest page update. */
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple Pages.
 */
["PageConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["PageEdge"],
	/** A list of the nodes contained in PageEdge. */
	nodes?:ResolverInputTypes["Page"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Page and a cursor during pagination.
 */
["PageEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of PageEdge. */
	node?:ResolverInputTypes["Page"],
		__typename?: boolean | `@${string}`
}>;
	/** Returns information about pagination in a connection, in accordance with the
[Relay specification](https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo).
For more information, please read our [GraphQL Pagination Usage Guide](https://shopify.dev/api/usage/pagination-graphql).
 */
["PageInfo"]: AliasType<{
	/** The cursor corresponding to the last node in edges. */
	endCursor?:boolean | `@${string}`,
	/** Whether there are more pages to fetch following the current page. */
	hasNextPage?:boolean | `@${string}`,
	/** Whether there are any pages prior to the current page. */
	hasPreviousPage?:boolean | `@${string}`,
	/** The cursor corresponding to the first node in edges. */
	startCursor?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Page query. */
["PageSortKeys"]:PageSortKeys;
	/** A payment applied to a checkout. */
["Payment"]: AliasType<{
	/** The amount of the payment. */
	amount?:ResolverInputTypes["MoneyV2"],
	/** The amount of the payment. */
	amountV2?:ResolverInputTypes["MoneyV2"],
	/** The billing address for the payment. */
	billingAddress?:ResolverInputTypes["MailingAddress"],
	/** The checkout to which the payment belongs. */
	checkout?:ResolverInputTypes["Checkout"],
	/** The credit card used for the payment in the case of direct payments. */
	creditCard?:ResolverInputTypes["CreditCard"],
	/** A message describing a processing error during asynchronous processing. */
	errorMessage?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** A client-side generated token to identify a payment and perform idempotent operations.
For more information, refer to
[Idempotent requests](https://shopify.dev/api/usage/idempotent-requests).
 */
	idempotencyKey?:boolean | `@${string}`,
	/** The URL where the customer needs to be redirected so they can complete the 3D Secure payment flow. */
	nextActionUrl?:boolean | `@${string}`,
	/** Whether the payment is still processing asynchronously. */
	ready?:boolean | `@${string}`,
	/** A flag to indicate if the payment is to be done in test mode for gateways that support it. */
	test?:boolean | `@${string}`,
	/** The actual transaction recorded by Shopify after having processed the payment with the gateway. */
	transaction?:ResolverInputTypes["Transaction"],
		__typename?: boolean | `@${string}`
}>;
	/** Settings related to payments. */
["PaymentSettings"]: AliasType<{
	/** List of the card brands which the shop accepts. */
	acceptedCardBrands?:boolean | `@${string}`,
	/** The url pointing to the endpoint to vault credit cards. */
	cardVaultUrl?:boolean | `@${string}`,
	/** The country where the shop is located. */
	countryCode?:boolean | `@${string}`,
	/** The three-letter code for the shop's primary currency. */
	currencyCode?:boolean | `@${string}`,
	/** A list of enabled currencies (ISO 4217 format) that the shop accepts. Merchants can enable currencies from their Shopify Payments settings in the Shopify admin. */
	enabledPresentmentCurrencies?:boolean | `@${string}`,
	/** The shop’s Shopify Payments account ID. */
	shopifyPaymentsAccountId?:boolean | `@${string}`,
	/** List of the digital wallets which the shop supports. */
	supportedDigitalWallets?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The valid values for the types of payment token. */
["PaymentTokenType"]:PaymentTokenType;
	/** The input fields for a filter used to view a subset of products in a collection matching a specific price range.
 */
["PriceRangeFilter"]: {
	/** The minimum price in the range. Defaults to zero. */
	min?: number | undefined | null,
	/** The maximum price in the range. Empty indicates no max price. */
	max?: number | undefined | null
};
	/** The value of the percentage pricing object. */
["PricingPercentageValue"]: AliasType<{
	/** The percentage value of the object. */
	percentage?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The price value (fixed or percentage) for a discount application. */
["PricingValue"]: AliasType<{
	MoneyV2?:ResolverInputTypes["MoneyV2"],
	PricingPercentageValue?:ResolverInputTypes["PricingPercentageValue"],
		__typename?: boolean | `@${string}`
}>;
	/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
For example, a digital download (such as a movie, music or ebook file) also qualifies as a product, as do services (such as equipment rental, work for hire, customization of another product or an extended warranty). */
["Product"]: AliasType<{
	/** Indicates if at least one product variant is available for sale. */
	availableForSale?:boolean | `@${string}`,
collections?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["CollectionConnection"]],
	/** The compare at price of the product across all variants. */
	compareAtPriceRange?:ResolverInputTypes["ProductPriceRange"],
	/** The date and time when the product was created. */
	createdAt?:boolean | `@${string}`,
description?: [{	/** Truncates string after the given length. */
	truncateAt?: number | undefined | null},boolean | `@${string}`],
	/** The description of the product, complete with HTML formatting. */
	descriptionHtml?:boolean | `@${string}`,
	/** The featured image for the product.

This field is functionally equivalent to `images(first: 1)`.
 */
	featuredImage?:ResolverInputTypes["Image"],
	/** A human-friendly unique string for the Product automatically generated from its title.
They are used by the Liquid templating language to refer to objects.
 */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
images?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["ProductImageSortKeys"] | undefined | null},ResolverInputTypes["ImageConnection"]],
	/** Whether the product is a gift card. */
	isGiftCard?:boolean | `@${string}`,
media?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["ProductMediaSortKeys"] | undefined | null},ResolverInputTypes["MediaConnection"]],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]],
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?:boolean | `@${string}`,
options?: [{	/** Truncate the array result to this size. */
	first?: number | undefined | null},ResolverInputTypes["ProductOption"]],
	/** The price range. */
	priceRange?:ResolverInputTypes["ProductPriceRange"],
	/** A categorization that a product can be tagged with, commonly used for filtering and searching. */
	productType?:boolean | `@${string}`,
	/** The date and time when the product was published to the channel. */
	publishedAt?:boolean | `@${string}`,
	/** Whether the product can only be purchased with a selling plan. */
	requiresSellingPlan?:boolean | `@${string}`,
sellingPlanGroups?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["SellingPlanGroupConnection"]],
	/** The product's SEO information. */
	seo?:ResolverInputTypes["SEO"],
	/** A comma separated list of tags that have been added to the product.
Additional access scope required for private apps: unauthenticated_read_product_tags.
 */
	tags?:boolean | `@${string}`,
	/** The product’s title. */
	title?:boolean | `@${string}`,
	/** The total quantity of inventory in stock for this Product. */
	totalInventory?:boolean | `@${string}`,
	/** The date and time when the product was last modified.
A product's `updatedAt` value can change for different reasons. For example, if an order
is placed for a product that has inventory tracking set up, then the inventory adjustment
is counted as an update.
 */
	updatedAt?:boolean | `@${string}`,
variantBySelectedOptions?: [{	/** The input fields used for a selected option. */
	selectedOptions: Array<ResolverInputTypes["SelectedOptionInput"]>},ResolverInputTypes["ProductVariant"]],
variants?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["ProductVariantSortKeys"] | undefined | null},ResolverInputTypes["ProductVariantConnection"]],
	/** The product’s vendor name. */
	vendor?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the ProductCollection query. */
["ProductCollectionSortKeys"]:ProductCollectionSortKeys;
	/** An auto-generated type for paginating through multiple Products.
 */
["ProductConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["ProductEdge"],
	/** A list of available filters. */
	filters?:ResolverInputTypes["Filter"],
	/** A list of the nodes contained in ProductEdge. */
	nodes?:ResolverInputTypes["Product"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one Product and a cursor during pagination.
 */
["ProductEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of ProductEdge. */
	node?:ResolverInputTypes["Product"],
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for a filter used to view a subset of products in a collection. */
["ProductFilter"]: {
	/** Filter on if the product is available for sale. */
	available?: boolean | undefined | null,
	/** A variant option to filter on. */
	variantOption?: ResolverInputTypes["VariantOptionFilter"] | undefined | null,
	/** The product type to filter on. */
	productType?: string | undefined | null,
	/** The product vendor to filter on. */
	productVendor?: string | undefined | null,
	/** A range of prices to filter with-in. */
	price?: ResolverInputTypes["PriceRangeFilter"] | undefined | null,
	/** A product metafield to filter on. */
	productMetafield?: ResolverInputTypes["MetafieldFilter"] | undefined | null,
	/** A variant metafield to filter on. */
	variantMetafield?: ResolverInputTypes["MetafieldFilter"] | undefined | null,
	/** A product tag to filter on. */
	tag?: string | undefined | null
};
	/** The set of valid sort keys for the ProductImage query. */
["ProductImageSortKeys"]:ProductImageSortKeys;
	/** The set of valid sort keys for the ProductMedia query. */
["ProductMediaSortKeys"]:ProductMediaSortKeys;
	/** Product property names like "Size", "Color", and "Material" that the customers can select.
Variants are selected based on permutations of these options.
255 characters limit each.
 */
["ProductOption"]: AliasType<{
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The product option’s name. */
	name?:boolean | `@${string}`,
	/** The corresponding value to the product option name. */
	values?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The price range of the product. */
["ProductPriceRange"]: AliasType<{
	/** The highest variant's price. */
	maxVariantPrice?:ResolverInputTypes["MoneyV2"],
	/** The lowest variant's price. */
	minVariantPrice?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the Product query. */
["ProductSortKeys"]:ProductSortKeys;
	/** A product variant represents a different version of a product, such as differing sizes or differing colors. */
["ProductVariant"]: AliasType<{
	/** Indicates if the product variant is available for sale. */
	availableForSale?:boolean | `@${string}`,
	/** The barcode (for example, ISBN, UPC, or GTIN) associated with the variant. */
	barcode?:boolean | `@${string}`,
	/** The compare at price of the variant. This can be used to mark a variant as on sale, when `compareAtPrice` is higher than `price`. */
	compareAtPrice?:ResolverInputTypes["MoneyV2"],
	/** The compare at price of the variant. This can be used to mark a variant as on sale, when `compareAtPriceV2` is higher than `priceV2`. */
	compareAtPriceV2?:ResolverInputTypes["MoneyV2"],
	/** Whether a product is out of stock but still available for purchase (used for backorders). */
	currentlyNotInStock?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** Image associated with the product variant. This field falls back to the product image if no image is available.
 */
	image?:ResolverInputTypes["Image"],
metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]],
	/** The product variant’s price. */
	price?:ResolverInputTypes["MoneyV2"],
	/** The product variant’s price. */
	priceV2?:ResolverInputTypes["MoneyV2"],
	/** The product object that the product variant belongs to. */
	product?:ResolverInputTypes["Product"],
	/** The total sellable quantity of the variant for online sales channels. */
	quantityAvailable?:boolean | `@${string}`,
	/** Whether a customer needs to provide a shipping address when placing an order for the product variant. */
	requiresShipping?:boolean | `@${string}`,
	/** List of product options applied to the variant. */
	selectedOptions?:ResolverInputTypes["SelectedOption"],
sellingPlanAllocations?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["SellingPlanAllocationConnection"]],
	/** The SKU (stock keeping unit) associated with the variant. */
	sku?:boolean | `@${string}`,
storeAvailability?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Used to sort results based on proximity to the provided location. */
	near?: ResolverInputTypes["GeoCoordinateInput"] | undefined | null},ResolverInputTypes["StoreAvailabilityConnection"]],
	/** The product variant’s title. */
	title?:boolean | `@${string}`,
	/** The unit price value for the variant based on the variant's measurement. */
	unitPrice?:ResolverInputTypes["MoneyV2"],
	/** The unit price measurement for the variant. */
	unitPriceMeasurement?:ResolverInputTypes["UnitPriceMeasurement"],
	/** The weight of the product variant in the unit system specified with `weight_unit`. */
	weight?:boolean | `@${string}`,
	/** Unit of measurement for weight. */
	weightUnit?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple ProductVariants.
 */
["ProductVariantConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["ProductVariantEdge"],
	/** A list of the nodes contained in ProductVariantEdge. */
	nodes?:ResolverInputTypes["ProductVariant"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one ProductVariant and a cursor during pagination.
 */
["ProductVariantEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of ProductVariantEdge. */
	node?:ResolverInputTypes["ProductVariant"],
		__typename?: boolean | `@${string}`
}>;
	/** The set of valid sort keys for the ProductVariant query. */
["ProductVariantSortKeys"]:ProductVariantSortKeys;
	/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
["QueryRoot"]: AliasType<{
articles?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["ArticleSortKeys"] | undefined | null,	/** Supported filter parameters:
 - `author`
 - `blog_title`
 - `created_at`
 - `tag`
 - `tag_not`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null},ResolverInputTypes["ArticleConnection"]],
blog?: [{	/** The ID of the `Blog`. */
	id?: string | undefined | null,	/** The handle of the `Blog`. */
	handle?: string | undefined | null},ResolverInputTypes["Blog"]],
blogByHandle?: [{	/** The handle of the blog. */
	handle: string},ResolverInputTypes["Blog"]],
blogs?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["BlogSortKeys"] | undefined | null,	/** Supported filter parameters:
 - `created_at`
 - `handle`
 - `title`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null},ResolverInputTypes["BlogConnection"]],
cart?: [{	/** The ID of the cart. */
	id: string},ResolverInputTypes["Cart"]],
collection?: [{	/** The ID of the `Collection`. */
	id?: string | undefined | null,	/** The handle of the `Collection`. */
	handle?: string | undefined | null},ResolverInputTypes["Collection"]],
collectionByHandle?: [{	/** The handle of the collection. */
	handle: string},ResolverInputTypes["Collection"]],
collections?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["CollectionSortKeys"] | undefined | null,	/** Supported filter parameters:
 - `collection_type`
 - `title`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null},ResolverInputTypes["CollectionConnection"]],
customer?: [{	/** The customer access token. */
	customerAccessToken: string},ResolverInputTypes["Customer"]],
	/** Returns the localized experiences configured for the shop. */
	localization?:ResolverInputTypes["Localization"],
locations?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["LocationSortKeys"] | undefined | null,	/** Used to sort results based on proximity to the provided location. */
	near?: ResolverInputTypes["GeoCoordinateInput"] | undefined | null},ResolverInputTypes["LocationConnection"]],
menu?: [{	/** The navigation menu's handle. */
	handle: string},ResolverInputTypes["Menu"]],
metaobject?: [{	/** The ID of the metaobject. */
	id?: string | undefined | null,	/** The handle and type of the metaobject. */
	handle?: ResolverInputTypes["MetaobjectHandleInput"] | undefined | null},ResolverInputTypes["Metaobject"]],
metaobjects?: [{	/** The type of metaobject to retrieve. */
	type: string,	/** The key of a field to sort with. Supports "id" and "updated_at". */
	sortKey?: string | undefined | null,	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["MetaobjectConnection"]],
node?: [{	/** The ID of the Node to return. */
	id: string},ResolverInputTypes["Node"]],
nodes?: [{	/** The IDs of the Nodes to return. */
	ids: Array<string>},ResolverInputTypes["Node"]],
page?: [{	/** The ID of the `Page`. */
	id?: string | undefined | null,	/** The handle of the `Page`. */
	handle?: string | undefined | null},ResolverInputTypes["Page"]],
pageByHandle?: [{	/** The handle of the page. */
	handle: string},ResolverInputTypes["Page"]],
pages?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["PageSortKeys"] | undefined | null,	/** Supported filter parameters:
 - `created_at`
 - `handle`
 - `title`
 - `updated_at`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null},ResolverInputTypes["PageConnection"]],
product?: [{	/** The ID of the `Product`. */
	id?: string | undefined | null,	/** The handle of the `Product`. */
	handle?: string | undefined | null},ResolverInputTypes["Product"]],
productByHandle?: [{	/** A unique string that identifies the product. Handles are automatically generated based on the product's title, and are always lowercase. Whitespace and special characters are replaced with a hyphen: `-`. If there are multiple consecutive whitespace or special characters, then they're replaced with a single hyphen. Whitespace or special characters at the beginning are removed. If a duplicate product title is used, then the handle is auto-incremented by one. For example, if you had two products called `Potion`, then their handles would be `potion` and `potion-1`. After a product has been created, changing the product title doesn't update the handle. */
	handle: string},ResolverInputTypes["Product"]],
productRecommendations?: [{	/** The id of the product. */
	productId: string},ResolverInputTypes["Product"]],
productTags?: [{	/** Returns up to the first `n` elements from the list. */
	first: number},ResolverInputTypes["StringConnection"]],
productTypes?: [{	/** Returns up to the first `n` elements from the list. */
	first: number},ResolverInputTypes["StringConnection"]],
products?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Sort the underlying list by the given key. */
	sortKey?: ResolverInputTypes["ProductSortKeys"] | undefined | null,	/** Supported filter parameters:
 - `available_for_sale`
 - `created_at`
 - `product_type`
 - `tag`
 - `tag_not`
 - `title`
 - `updated_at`
 - `variants.price`
 - `vendor`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null},ResolverInputTypes["ProductConnection"]],
	/** The list of public Storefront API versions, including supported, release candidate and unstable versions. */
	publicApiVersions?:ResolverInputTypes["ApiVersion"],
	/** The shop associated with the storefront access token. */
	shop?:ResolverInputTypes["Shop"],
urlRedirects?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null,	/** Supported filter parameters:
 - `created_at`
 - `path`
 - `target`

See the detailed [search syntax](https://shopify.dev/api/usage/search-syntax)
for more information about using filters.
 */
	query?: string | undefined | null},ResolverInputTypes["UrlRedirectConnection"]],
		__typename?: boolean | `@${string}`
}>;
	/** SEO information. */
["SEO"]: AliasType<{
	/** The meta description. */
	description?:boolean | `@${string}`,
	/** The SEO title. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Script discount applications capture the intentions of a discount that
was created by a Shopify Script.
 */
["ScriptDiscountApplication"]: AliasType<{
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod?:boolean | `@${string}`,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection?:boolean | `@${string}`,
	/** The type of line that the discount is applicable towards. */
	targetType?:boolean | `@${string}`,
	/** The title of the application as defined by the Script. */
	title?:boolean | `@${string}`,
	/** The value of the discount application. */
	value?:ResolverInputTypes["PricingValue"],
		__typename?: boolean | `@${string}`
}>;
	/** Properties used by customers to select a product variant.
Products can have multiple options, like different sizes or colors.
 */
["SelectedOption"]: AliasType<{
	/** The product option’s name. */
	name?:boolean | `@${string}`,
	/** The product option’s value. */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields required for a selected option. */
["SelectedOptionInput"]: {
	/** The product option’s name. */
	name: string,
	/** The product option’s value. */
	value: string
};
	/** Represents how products and variants can be sold and purchased. */
["SellingPlan"]: AliasType<{
	/** The initial payment due for the purchase. */
	checkoutCharge?:ResolverInputTypes["SellingPlanCheckoutCharge"],
	/** The description of the selling plan. */
	description?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'. */
	name?:boolean | `@${string}`,
	/** The selling plan options available in the drop-down list in the storefront. For example, 'Delivery every week' or 'Delivery every 2 weeks' specifies the delivery frequency options for the product. Individual selling plans contribute their options to the associated selling plan group. For example, a selling plan group might have an option called `option1: Delivery every`. One selling plan in that group could contribute `option1: 2 weeks` with the pricing for that option, and another selling plan could contribute `option1: 4 weeks`, with different pricing. */
	options?:ResolverInputTypes["SellingPlanOption"],
	/** The price adjustments that a selling plan makes when a variant is purchased with a selling plan. */
	priceAdjustments?:ResolverInputTypes["SellingPlanPriceAdjustment"],
	/** Whether purchasing the selling plan will result in multiple deliveries. */
	recurringDeliveries?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents an association between a variant and a selling plan. Selling plan allocations describe the options offered for each variant, and the price of the variant when purchased with a selling plan. */
["SellingPlanAllocation"]: AliasType<{
	/** The checkout charge amount due for the purchase. */
	checkoutChargeAmount?:ResolverInputTypes["MoneyV2"],
	/** A list of price adjustments, with a maximum of two. When there are two, the first price adjustment goes into effect at the time of purchase, while the second one starts after a certain number of orders. A price adjustment represents how a selling plan affects pricing when a variant is purchased with a selling plan. Prices display in the customer's currency if the shop is configured for it. */
	priceAdjustments?:ResolverInputTypes["SellingPlanAllocationPriceAdjustment"],
	/** The remaining balance charge amount due for the purchase. */
	remainingBalanceChargeAmount?:ResolverInputTypes["MoneyV2"],
	/** A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'. */
	sellingPlan?:ResolverInputTypes["SellingPlan"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple SellingPlanAllocations.
 */
["SellingPlanAllocationConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["SellingPlanAllocationEdge"],
	/** A list of the nodes contained in SellingPlanAllocationEdge. */
	nodes?:ResolverInputTypes["SellingPlanAllocation"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one SellingPlanAllocation and a cursor during pagination.
 */
["SellingPlanAllocationEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of SellingPlanAllocationEdge. */
	node?:ResolverInputTypes["SellingPlanAllocation"],
		__typename?: boolean | `@${string}`
}>;
	/** The resulting prices for variants when they're purchased with a specific selling plan. */
["SellingPlanAllocationPriceAdjustment"]: AliasType<{
	/** The price of the variant when it's purchased without a selling plan for the same number of deliveries. For example, if a customer purchases 6 deliveries of $10.00 granola separately, then the price is 6 x $10.00 = $60.00. */
	compareAtPrice?:ResolverInputTypes["MoneyV2"],
	/** The effective price for a single delivery. For example, for a prepaid subscription plan that includes 6 deliveries at the price of $48.00, the per delivery price is $8.00. */
	perDeliveryPrice?:ResolverInputTypes["MoneyV2"],
	/** The price of the variant when it's purchased with a selling plan For example, for a prepaid subscription plan that includes 6 deliveries of $10.00 granola, where the customer gets 20% off, the price is 6 x $10.00 x 0.80 = $48.00. */
	price?:ResolverInputTypes["MoneyV2"],
	/** The resulting price per unit for the variant associated with the selling plan. If the variant isn't sold by quantity or measurement, then this field returns `null`. */
	unitPrice?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** The initial payment due for the purchase. */
["SellingPlanCheckoutCharge"]: AliasType<{
	/** The charge type for the checkout charge. */
	type?:boolean | `@${string}`,
	/** The charge value for the checkout charge. */
	value?:ResolverInputTypes["SellingPlanCheckoutChargeValue"],
		__typename?: boolean | `@${string}`
}>;
	/** The percentage value of the price used for checkout charge. */
["SellingPlanCheckoutChargePercentageValue"]: AliasType<{
	/** The percentage value of the price used for checkout charge. */
	percentage?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The checkout charge when the full amount isn't charged at checkout. */
["SellingPlanCheckoutChargeType"]:SellingPlanCheckoutChargeType;
	/** The portion of the price to be charged at checkout. */
["SellingPlanCheckoutChargeValue"]: AliasType<{
	MoneyV2?:ResolverInputTypes["MoneyV2"],
	SellingPlanCheckoutChargePercentageValue?:ResolverInputTypes["SellingPlanCheckoutChargePercentageValue"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple SellingPlans.
 */
["SellingPlanConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["SellingPlanEdge"],
	/** A list of the nodes contained in SellingPlanEdge. */
	nodes?:ResolverInputTypes["SellingPlan"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one SellingPlan and a cursor during pagination.
 */
["SellingPlanEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of SellingPlanEdge. */
	node?:ResolverInputTypes["SellingPlan"],
		__typename?: boolean | `@${string}`
}>;
	/** A fixed amount that's deducted from the original variant price. For example, $10.00 off. */
["SellingPlanFixedAmountPriceAdjustment"]: AliasType<{
	/** The money value of the price adjustment. */
	adjustmentAmount?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** A fixed price adjustment for a variant that's purchased with a selling plan. */
["SellingPlanFixedPriceAdjustment"]: AliasType<{
	/** A new price of the variant when it's purchased with the selling plan. */
	price?:ResolverInputTypes["MoneyV2"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a selling method. For example, 'Subscribe and save' is a selling method where customers pay for goods or services per delivery. A selling plan group contains individual selling plans. */
["SellingPlanGroup"]: AliasType<{
	/** A display friendly name for the app that created the selling plan group. */
	appName?:boolean | `@${string}`,
	/** The name of the selling plan group. */
	name?:boolean | `@${string}`,
	/** Represents the selling plan options available in the drop-down list in the storefront. For example, 'Delivery every week' or 'Delivery every 2 weeks' specifies the delivery frequency options for the product. */
	options?:ResolverInputTypes["SellingPlanGroupOption"],
sellingPlans?: [{	/** Returns up to the first `n` elements from the list. */
	first?: number | undefined | null,	/** Returns the elements that come after the specified cursor. */
	after?: string | undefined | null,	/** Returns up to the last `n` elements from the list. */
	last?: number | undefined | null,	/** Returns the elements that come before the specified cursor. */
	before?: string | undefined | null,	/** Reverse the order of the underlying list. */
	reverse?: boolean | undefined | null},ResolverInputTypes["SellingPlanConnection"]],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple SellingPlanGroups.
 */
["SellingPlanGroupConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["SellingPlanGroupEdge"],
	/** A list of the nodes contained in SellingPlanGroupEdge. */
	nodes?:ResolverInputTypes["SellingPlanGroup"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one SellingPlanGroup and a cursor during pagination.
 */
["SellingPlanGroupEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of SellingPlanGroupEdge. */
	node?:ResolverInputTypes["SellingPlanGroup"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an option on a selling plan group that's available in the drop-down list in the storefront.

Individual selling plans contribute their options to the associated selling plan group. For example, a selling plan group might have an option called `option1: Delivery every`. One selling plan in that group could contribute `option1: 2 weeks` with the pricing for that option, and another selling plan could contribute `option1: 4 weeks`, with different pricing. */
["SellingPlanGroupOption"]: AliasType<{
	/** The name of the option. For example, 'Delivery every'. */
	name?:boolean | `@${string}`,
	/** The values for the options specified by the selling plans in the selling plan group. For example, '1 week', '2 weeks', '3 weeks'. */
	values?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An option provided by a Selling Plan. */
["SellingPlanOption"]: AliasType<{
	/** The name of the option (ie "Delivery every"). */
	name?:boolean | `@${string}`,
	/** The value of the option (ie "Month"). */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A percentage amount that's deducted from the original variant price. For example, 10% off. */
["SellingPlanPercentagePriceAdjustment"]: AliasType<{
	/** The percentage value of the price adjustment. */
	adjustmentPercentage?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents by how much the price of a variant associated with a selling plan is adjusted. Each variant can have up to two price adjustments. If a variant has multiple price adjustments, then the first price adjustment applies when the variant is initially purchased. The second price adjustment applies after a certain number of orders (specified by the `orderCount` field) are made. If a selling plan doesn't have any price adjustments, then the unadjusted price of the variant is the effective price. */
["SellingPlanPriceAdjustment"]: AliasType<{
	/** The type of price adjustment. An adjustment value can have one of three types: percentage, amount off, or a new price. */
	adjustmentValue?:ResolverInputTypes["SellingPlanPriceAdjustmentValue"],
	/** The number of orders that the price adjustment applies to. If the price adjustment always applies, then this field is `null`. */
	orderCount?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents by how much the price of a variant associated with a selling plan is adjusted. Each variant can have up to two price adjustments. */
["SellingPlanPriceAdjustmentValue"]: AliasType<{
	SellingPlanFixedAmountPriceAdjustment?:ResolverInputTypes["SellingPlanFixedAmountPriceAdjustment"],
	SellingPlanFixedPriceAdjustment?:ResolverInputTypes["SellingPlanFixedPriceAdjustment"],
	SellingPlanPercentagePriceAdjustment?:ResolverInputTypes["SellingPlanPercentagePriceAdjustment"],
		__typename?: boolean | `@${string}`
}>;
	/** A shipping rate to be applied to a checkout. */
["ShippingRate"]: AliasType<{
	/** Human-readable unique identifier for this shipping rate. */
	handle?:boolean | `@${string}`,
	/** Price of this shipping rate. */
	price?:ResolverInputTypes["MoneyV2"],
	/** Price of this shipping rate. */
	priceV2?:ResolverInputTypes["MoneyV2"],
	/** Title of this shipping rate. */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Shop represents a collection of the general settings and information about the shop. */
["Shop"]: AliasType<{
	/** The shop's branding configuration. */
	brand?:ResolverInputTypes["Brand"],
	/** A description of the shop. */
	description?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
metafield?: [{	/** A container for a set of metafields. */
	namespace: string,	/** The identifier for the metafield. */
	key: string},ResolverInputTypes["Metafield"]],
metafields?: [{	/** The list of metafields to retrieve by namespace and key. */
	identifiers: Array<ResolverInputTypes["HasMetafieldsIdentifier"]>},ResolverInputTypes["Metafield"]],
	/** A string representing the way currency is formatted when the currency isn’t specified. */
	moneyFormat?:boolean | `@${string}`,
	/** The shop’s name. */
	name?:boolean | `@${string}`,
	/** Settings related to payments. */
	paymentSettings?:ResolverInputTypes["PaymentSettings"],
	/** The primary domain of the shop’s Online Store. */
	primaryDomain?:ResolverInputTypes["Domain"],
	/** The shop’s privacy policy. */
	privacyPolicy?:ResolverInputTypes["ShopPolicy"],
	/** The shop’s refund policy. */
	refundPolicy?:ResolverInputTypes["ShopPolicy"],
	/** The shop’s shipping policy. */
	shippingPolicy?:ResolverInputTypes["ShopPolicy"],
	/** Countries that the shop ships to. */
	shipsToCountries?:boolean | `@${string}`,
	/** The shop’s subscription policy. */
	subscriptionPolicy?:ResolverInputTypes["ShopPolicyWithDefault"],
	/** The shop’s terms of service. */
	termsOfService?:ResolverInputTypes["ShopPolicy"],
		__typename?: boolean | `@${string}`
}>;
	/** Policy that a merchant has configured for their store, such as their refund or privacy policy. */
["ShopPolicy"]: AliasType<{
	/** Policy text, maximum size of 64kb. */
	body?:boolean | `@${string}`,
	/** Policy’s handle. */
	handle?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** Policy’s title. */
	title?:boolean | `@${string}`,
	/** Public URL to the policy. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** A policy for the store that comes with a default value, such as a subscription policy.
If the merchant hasn't configured a policy for their store, then the policy will return the default value.
Otherwise, the policy will return the merchant-configured value.
 */
["ShopPolicyWithDefault"]: AliasType<{
	/** The text of the policy. Maximum size: 64KB. */
	body?:boolean | `@${string}`,
	/** The handle of the policy. */
	handle?:boolean | `@${string}`,
	/** The unique ID of the policy. A default policy doesn't have an ID. */
	id?:boolean | `@${string}`,
	/** The title of the policy. */
	title?:boolean | `@${string}`,
	/** Public URL to the policy. */
	url?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The availability of a product variant at a particular location.
Local pick-up must be enabled in the  store's shipping settings, otherwise this will return an empty result.
 */
["StoreAvailability"]: AliasType<{
	/** Whether the product variant is in-stock at this location. */
	available?:boolean | `@${string}`,
	/** The location where this product variant is stocked at. */
	location?:ResolverInputTypes["Location"],
	/** Returns the estimated amount of time it takes for pickup to be ready (Example: Usually ready in 24 hours). */
	pickUpTime?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple StoreAvailabilities.
 */
["StoreAvailabilityConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["StoreAvailabilityEdge"],
	/** A list of the nodes contained in StoreAvailabilityEdge. */
	nodes?:ResolverInputTypes["StoreAvailability"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one StoreAvailability and a cursor during pagination.
 */
["StoreAvailabilityEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of StoreAvailabilityEdge. */
	node?:ResolverInputTypes["StoreAvailability"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through a list of Strings.
 */
["StringConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["StringEdge"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one String and a cursor during pagination.
 */
["StringEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of StringEdge. */
	node?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Specifies the fields required to complete a checkout with
a tokenized payment.
 */
["TokenizedPaymentInputV3"]: {
	/** The amount and currency of the payment. */
	paymentAmount: ResolverInputTypes["MoneyInput"],
	/** A unique client generated key used to avoid duplicate charges. When a duplicate payment is found, the original is returned instead of creating a new one. For more information, refer to [Idempotent requests](https://shopify.dev/api/usage/idempotent-requests). */
	idempotencyKey: string,
	/** The billing address for the payment. */
	billingAddress: ResolverInputTypes["MailingAddressInput"],
	/** A simple string or JSON containing the required payment data for the tokenized payment. */
	paymentData: string,
	/** Whether to execute the payment in test mode, if possible. Test mode is not supported in production stores. Defaults to `false`. */
	test?: boolean | undefined | null,
	/** Public Hash Key used for AndroidPay payments only. */
	identifier?: string | undefined | null,
	/** The type of payment token. */
	type: ResolverInputTypes["PaymentTokenType"]
};
	/** An object representing exchange of money for a product or service. */
["Transaction"]: AliasType<{
	/** The amount of money that the transaction was for. */
	amount?:ResolverInputTypes["MoneyV2"],
	/** The amount of money that the transaction was for. */
	amountV2?:ResolverInputTypes["MoneyV2"],
	/** The kind of the transaction. */
	kind?:boolean | `@${string}`,
	/** The status of the transaction. */
	status?:boolean | `@${string}`,
	/** The status of the transaction. */
	statusV2?:boolean | `@${string}`,
	/** Whether the transaction was done in test mode or not. */
	test?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The different kinds of order transactions. */
["TransactionKind"]:TransactionKind;
	/** Transaction statuses describe the status of a transaction. */
["TransactionStatus"]:TransactionStatus;
	/** Represents an [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986) and
[RFC 3987](https://datatracker.ietf.org/doc/html/rfc3987)-compliant URI string.

For example, `"https://johns-apparel.myshopify.com"` is a valid URL. It includes a scheme (`https`) and a host
(`johns-apparel.myshopify.com`).
 */
["URL"]:unknown;
	/** The measurement used to calculate a unit price for a product variant (e.g. $9.99 / 100ml).
 */
["UnitPriceMeasurement"]: AliasType<{
	/** The type of unit of measurement for the unit price measurement. */
	measuredType?:boolean | `@${string}`,
	/** The quantity unit for the unit price measurement. */
	quantityUnit?:boolean | `@${string}`,
	/** The quantity value for the unit price measurement. */
	quantityValue?:boolean | `@${string}`,
	/** The reference unit for the unit price measurement. */
	referenceUnit?:boolean | `@${string}`,
	/** The reference value for the unit price measurement. */
	referenceValue?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The accepted types of unit of measurement. */
["UnitPriceMeasurementMeasuredType"]:UnitPriceMeasurementMeasuredType;
	/** The valid units of measurement for a unit price measurement. */
["UnitPriceMeasurementMeasuredUnit"]:UnitPriceMeasurementMeasuredUnit;
	/** Systems of weights and measures. */
["UnitSystem"]:UnitSystem;
	/** An unsigned 64-bit integer. Represents whole numeric values between 0 and 2^64 - 1 encoded as a string of base-10 digits.

Example value: `"50"`.
 */
["UnsignedInt64"]:unknown;
	/** A redirect on the online store. */
["UrlRedirect"]: AliasType<{
	/** The ID of the URL redirect. */
	id?:boolean | `@${string}`,
	/** The old path to be redirected from. When the user visits this path, they'll be redirected to the target location. */
	path?:boolean | `@${string}`,
	/** The target location where the user will be redirected to. */
	target?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type for paginating through multiple UrlRedirects.
 */
["UrlRedirectConnection"]: AliasType<{
	/** A list of edges. */
	edges?:ResolverInputTypes["UrlRedirectEdge"],
	/** A list of the nodes contained in UrlRedirectEdge. */
	nodes?:ResolverInputTypes["UrlRedirect"],
	/** Information to aid in pagination. */
	pageInfo?:ResolverInputTypes["PageInfo"],
		__typename?: boolean | `@${string}`
}>;
	/** An auto-generated type which holds one UrlRedirect and a cursor during pagination.
 */
["UrlRedirectEdge"]: AliasType<{
	/** A cursor for use in pagination. */
	cursor?:boolean | `@${string}`,
	/** The item at the end of UrlRedirectEdge. */
	node?:ResolverInputTypes["UrlRedirect"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents an error in the input of a mutation. */
["UserError"]: AliasType<{
	/** The path to the input field that caused the error. */
	field?:boolean | `@${string}`,
	/** The error message. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** The input fields for a filter used to view a subset of products in a collection matching a specific variant option.
 */
["VariantOptionFilter"]: {
	/** The name of the variant option to filter on. */
	name: string,
	/** The value of the variant option to filter on. */
	value: string
};
	/** Represents a Shopify hosted video. */
["Video"]: AliasType<{
	/** A word or phrase to share the nature or contents of a media. */
	alt?:boolean | `@${string}`,
	/** A globally-unique ID. */
	id?:boolean | `@${string}`,
	/** The media content type. */
	mediaContentType?:boolean | `@${string}`,
	/** The preview image for the media. */
	previewImage?:ResolverInputTypes["Image"],
	/** The sources for a video. */
	sources?:ResolverInputTypes["VideoSource"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents a source for a Shopify hosted video. */
["VideoSource"]: AliasType<{
	/** The format of the video source. */
	format?:boolean | `@${string}`,
	/** The height of the video. */
	height?:boolean | `@${string}`,
	/** The video MIME type. */
	mimeType?:boolean | `@${string}`,
	/** The URL of the video. */
	url?:boolean | `@${string}`,
	/** The width of the video. */
	width?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Units of measurement for weight. */
["WeightUnit"]:WeightUnit
  }

export type ModelTypes = {
    /** A version of the API, as defined by [Shopify API versioning](https://shopify.dev/api/usage/versioning).
Versions are commonly referred to by their handle (for example, `2021-10`).
 */
["ApiVersion"]: {
		/** The human-readable name of the version. */
	displayName: string,
	/** The unique identifier of an ApiVersion. All supported API versions have a date-based (YYYY-MM) or `unstable` handle. */
	handle: string,
	/** Whether the version is actively supported by Shopify. Supported API versions are guaranteed to be stable. Unsupported API versions include unstable, release candidate, and end-of-life versions that are marked as unsupported. For more information, refer to [Versioning](https://shopify.dev/api/usage/versioning). */
	supported: boolean
};
	/** Details about the gift card used on the checkout. */
["AppliedGiftCard"]: {
		/** The amount that was taken from the gift card by applying it. */
	amountUsed: ModelTypes["MoneyV2"],
	/** The amount that was taken from the gift card by applying it. */
	amountUsedV2: ModelTypes["MoneyV2"],
	/** The amount left on the gift card. */
	balance: ModelTypes["MoneyV2"],
	/** The amount left on the gift card. */
	balanceV2: ModelTypes["MoneyV2"],
	/** A globally-unique ID. */
	id: string,
	/** The last characters of the gift card. */
	lastCharacters: string,
	/** The amount that was applied to the checkout in its currency. */
	presentmentAmountUsed: ModelTypes["MoneyV2"]
};
	/** An article in an online store blog. */
["Article"]: {
		/** The article's author. */
	author: ModelTypes["ArticleAuthor"],
	/** The article's author. */
	authorV2?: ModelTypes["ArticleAuthor"] | undefined,
	/** The blog that the article belongs to. */
	blog: ModelTypes["Blog"],
	/** List of comments posted on the article. */
	comments: ModelTypes["CommentConnection"],
	/** Stripped content of the article, single line with HTML tags removed. */
	content: string,
	/** The content of the article, complete with HTML formatting. */
	contentHtml: ModelTypes["HTML"],
	/** Stripped excerpt of the article, single line with HTML tags removed. */
	excerpt?: string | undefined,
	/** The excerpt of the article, complete with HTML formatting. */
	excerptHtml?: ModelTypes["HTML"] | undefined,
	/** A human-friendly unique string for the Article automatically generated from its title.
 */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** The image associated with the article. */
	image?: ModelTypes["Image"] | undefined,
	/** Returns a metafield found by namespace and key. */
	metafield?: ModelTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<ModelTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: ModelTypes["URL"] | undefined,
	/** The date and time when the article was published. */
	publishedAt: ModelTypes["DateTime"],
	/** The article’s SEO information. */
	seo?: ModelTypes["SEO"] | undefined,
	/** A categorization that a article can be tagged with. */
	tags: Array<string>,
	/** The article’s name. */
	title: string
};
	/** The author of an article. */
["ArticleAuthor"]: {
		/** The author's bio. */
	bio?: string | undefined,
	/** The author’s email. */
	email: string,
	/** The author's first name. */
	firstName: string,
	/** The author's last name. */
	lastName: string,
	/** The author's full name. */
	name: string
};
	/** An auto-generated type for paginating through multiple Articles.
 */
["ArticleConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["ArticleEdge"]>,
	/** A list of the nodes contained in ArticleEdge. */
	nodes: Array<ModelTypes["Article"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one Article and a cursor during pagination.
 */
["ArticleEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of ArticleEdge. */
	node: ModelTypes["Article"]
};
	["ArticleSortKeys"]:ArticleSortKeys;
	/** Represents a generic custom attribute. */
["Attribute"]: {
		/** Key or name of the attribute. */
	key: string,
	/** Value of the attribute. */
	value?: string | undefined
};
	/** The input fields for an attribute. */
["AttributeInput"]: {
	/** Key or name of the attribute. */
	key: string,
	/** Value of the attribute. */
	value: string
};
	/** Automatic discount applications capture the intentions of a discount that was automatically applied.
 */
["AutomaticDiscountApplication"]: {
		/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod: ModelTypes["DiscountApplicationAllocationMethod"],
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection: ModelTypes["DiscountApplicationTargetSelection"],
	/** The type of line that the discount is applicable towards. */
	targetType: ModelTypes["DiscountApplicationTargetType"],
	/** The title of the application. */
	title: string,
	/** The value of the discount application. */
	value: ModelTypes["PricingValue"]
};
	/** A collection of available shipping rates for a checkout. */
["AvailableShippingRates"]: {
		/** Whether or not the shipping rates are ready.
The `shippingRates` field is `null` when this value is `false`.
This field should be polled until its value becomes `true`.
 */
	ready: boolean,
	/** The fetched shipping rates. `null` until the `ready` field is `true`. */
	shippingRates?: Array<ModelTypes["ShippingRate"]> | undefined
};
	/** An online store blog. */
["Blog"]: {
		/** Find an article by its handle. */
	articleByHandle?: ModelTypes["Article"] | undefined,
	/** List of the blog's articles. */
	articles: ModelTypes["ArticleConnection"],
	/** The authors who have contributed to the blog. */
	authors: Array<ModelTypes["ArticleAuthor"]>,
	/** A human-friendly unique string for the Blog automatically generated from its title.
 */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** Returns a metafield found by namespace and key. */
	metafield?: ModelTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<ModelTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: ModelTypes["URL"] | undefined,
	/** The blog's SEO information. */
	seo?: ModelTypes["SEO"] | undefined,
	/** The blogs’s title. */
	title: string
};
	/** An auto-generated type for paginating through multiple Blogs.
 */
["BlogConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["BlogEdge"]>,
	/** A list of the nodes contained in BlogEdge. */
	nodes: Array<ModelTypes["Blog"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one Blog and a cursor during pagination.
 */
["BlogEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of BlogEdge. */
	node: ModelTypes["Blog"]
};
	["BlogSortKeys"]:BlogSortKeys;
	/** The store's [branding configuration](https://help.shopify.com/en/manual/promoting-marketing/managing-brand-assets).
 */
["Brand"]: {
		/** The colors of the store's brand. */
	colors: ModelTypes["BrandColors"],
	/** The store's cover image. */
	coverImage?: ModelTypes["MediaImage"] | undefined,
	/** The store's default logo. */
	logo?: ModelTypes["MediaImage"] | undefined,
	/** The store's short description. */
	shortDescription?: string | undefined,
	/** The store's slogan. */
	slogan?: string | undefined,
	/** The store's preferred logo for square UI elements. */
	squareLogo?: ModelTypes["MediaImage"] | undefined
};
	/** A group of related colors for the shop's brand.
 */
["BrandColorGroup"]: {
		/** The background color. */
	background?: ModelTypes["Color"] | undefined,
	/** The foreground color. */
	foreground?: ModelTypes["Color"] | undefined
};
	/** The colors of the shop's brand.
 */
["BrandColors"]: {
		/** The shop's primary brand colors. */
	primary: Array<ModelTypes["BrandColorGroup"]>,
	/** The shop's secondary brand colors. */
	secondary: Array<ModelTypes["BrandColorGroup"]>
};
	["CardBrand"]:CardBrand;
	/** A cart represents the merchandise that a buyer intends to purchase,
and the estimated cost associated with the cart. Learn how to
[interact with a cart](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
during a customer's session.
 */
["Cart"]: {
		/** An attribute associated with the cart. */
	attribute?: ModelTypes["Attribute"] | undefined,
	/** The attributes associated with the cart. Attributes are represented as key-value pairs. */
	attributes: Array<ModelTypes["Attribute"]>,
	/** Information about the buyer that is interacting with the cart. */
	buyerIdentity: ModelTypes["CartBuyerIdentity"],
	/** The URL of the checkout for the cart. */
	checkoutUrl: ModelTypes["URL"],
	/** The estimated costs that the buyer will pay at checkout. The costs are subject to change and changes will be reflected at checkout. The `cost` field uses the `buyerIdentity` field to determine [international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing). */
	cost: ModelTypes["CartCost"],
	/** The date and time when the cart was created. */
	createdAt: ModelTypes["DateTime"],
	/** The delivery groups available for the cart, based on the buyer identity default
delivery address preference or the default address of the logged-in customer.
 */
	deliveryGroups: ModelTypes["CartDeliveryGroupConnection"],
	/** The discounts that have been applied to the entire cart. */
	discountAllocations: Array<ModelTypes["CartDiscountAllocation"]>,
	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes: Array<ModelTypes["CartDiscountCode"]>,
	/** The estimated costs that the buyer will pay at checkout.
The estimated costs are subject to change and changes will be reflected at checkout.
The `estimatedCost` field uses the `buyerIdentity` field to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
	estimatedCost: ModelTypes["CartEstimatedCost"],
	/** A globally-unique ID. */
	id: string,
	/** A list of lines containing information about the items the customer intends to purchase. */
	lines: ModelTypes["CartLineConnection"],
	/** A note that is associated with the cart. For example, the note can be a personalized message to the buyer. */
	note?: string | undefined,
	/** The total number of items in the cart. */
	totalQuantity: number,
	/** The date and time when the cart was updated. */
	updatedAt: ModelTypes["DateTime"]
};
	/** Return type for `cartAttributesUpdate` mutation. */
["CartAttributesUpdatePayload"]: {
		/** The updated cart. */
	cart?: ModelTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CartUserError"]>
};
	/** The discounts automatically applied to the cart line based on prerequisites that have been met. */
["CartAutomaticDiscountAllocation"]: {
		/** The discounted amount that has been applied to the cart line. */
	discountedAmount: ModelTypes["MoneyV2"],
	/** The title of the allocated discount. */
	title: string
};
	/** Represents information about the buyer that is interacting with the cart. */
["CartBuyerIdentity"]: {
		/** The country where the buyer is located. */
	countryCode?: ModelTypes["CountryCode"] | undefined,
	/** The customer account associated with the cart. */
	customer?: ModelTypes["Customer"] | undefined,
	/** An ordered set of delivery addresses tied to the buyer that is interacting with the cart.
The rank of the preferences is determined by the order of the addresses in the array. Preferences
can be used to populate relevant fields in the checkout flow.
 */
	deliveryAddressPreferences: Array<ModelTypes["DeliveryAddress"]>,
	/** The email address of the buyer that is interacting with the cart. */
	email?: string | undefined,
	/** The phone number of the buyer that is interacting with the cart. */
	phone?: string | undefined
};
	/** Specifies the input fields to update the buyer information associated with a cart.
Buyer identity is used to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
and should match the customer's shipping address.
 */
["CartBuyerIdentityInput"]: {
	/** The email address of the buyer that is interacting with the cart. */
	email?: string | undefined,
	/** The phone number of the buyer that is interacting with the cart. */
	phone?: string | undefined,
	/** The country where the buyer is located. */
	countryCode?: ModelTypes["CountryCode"] | undefined,
	/** The access token used to identify the customer associated with the cart. */
	customerAccessToken?: string | undefined,
	/** An ordered set of delivery addresses tied to the buyer that is interacting with the cart.
The rank of the preferences is determined by the order of the addresses in the array. Preferences
can be used to populate relevant fields in the checkout flow.
 */
	deliveryAddressPreferences?: Array<ModelTypes["DeliveryAddressInput"]> | undefined
};
	/** Return type for `cartBuyerIdentityUpdate` mutation. */
["CartBuyerIdentityUpdatePayload"]: {
		/** The updated cart. */
	cart?: ModelTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CartUserError"]>
};
	/** The discount that has been applied to the cart line using a discount code. */
["CartCodeDiscountAllocation"]: {
		/** The code used to apply the discount. */
	code: string,
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount: ModelTypes["MoneyV2"]
};
	/** The costs that the buyer will pay at checkout.
The cart cost uses [`CartBuyerIdentity`](https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity) to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
["CartCost"]: {
		/** The estimated amount, before taxes and discounts, for the customer to pay at checkout. The checkout charge amount doesn't include any deferred payments that'll be paid at a later date. If the cart has no deferred payments, then the checkout charge amount is equivalent to `subtotalAmount`. */
	checkoutChargeAmount: ModelTypes["MoneyV2"],
	/** The amount, before taxes and cart-level discounts, for the customer to pay. */
	subtotalAmount: ModelTypes["MoneyV2"],
	/** Whether the subtotal amount is estimated. */
	subtotalAmountEstimated: boolean,
	/** The total amount for the customer to pay. */
	totalAmount: ModelTypes["MoneyV2"],
	/** Whether the total amount is estimated. */
	totalAmountEstimated: boolean,
	/** The duty amount for the customer to pay at checkout. */
	totalDutyAmount?: ModelTypes["MoneyV2"] | undefined,
	/** Whether the total duty amount is estimated. */
	totalDutyAmountEstimated: boolean,
	/** The tax amount for the customer to pay at checkout. */
	totalTaxAmount?: ModelTypes["MoneyV2"] | undefined,
	/** Whether the total tax amount is estimated. */
	totalTaxAmountEstimated: boolean
};
	/** Return type for `cartCreate` mutation. */
["CartCreatePayload"]: {
		/** The new cart. */
	cart?: ModelTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CartUserError"]>
};
	/** The discounts automatically applied to the cart line based on prerequisites that have been met. */
["CartCustomDiscountAllocation"]: {
		/** The discounted amount that has been applied to the cart line. */
	discountedAmount: ModelTypes["MoneyV2"],
	/** The title of the allocated discount. */
	title: string
};
	/** Information about the options available for one or more line items to be delivered to a specific address. */
["CartDeliveryGroup"]: {
		/** A list of cart lines for the delivery group. */
	cartLines: ModelTypes["CartLineConnection"],
	/** The destination address for the delivery group. */
	deliveryAddress: ModelTypes["MailingAddress"],
	/** The delivery options available for the delivery group. */
	deliveryOptions: Array<ModelTypes["CartDeliveryOption"]>,
	/** The ID for the delivery group. */
	id: string,
	/** The selected delivery option for the delivery group. */
	selectedDeliveryOption?: ModelTypes["CartDeliveryOption"] | undefined
};
	/** An auto-generated type for paginating through multiple CartDeliveryGroups.
 */
["CartDeliveryGroupConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["CartDeliveryGroupEdge"]>,
	/** A list of the nodes contained in CartDeliveryGroupEdge. */
	nodes: Array<ModelTypes["CartDeliveryGroup"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one CartDeliveryGroup and a cursor during pagination.
 */
["CartDeliveryGroupEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CartDeliveryGroupEdge. */
	node: ModelTypes["CartDeliveryGroup"]
};
	/** Information about a delivery option. */
["CartDeliveryOption"]: {
		/** The code of the delivery option. */
	code?: string | undefined,
	/** The method for the delivery option. */
	deliveryMethodType: ModelTypes["DeliveryMethodType"],
	/** The description of the delivery option. */
	description?: string | undefined,
	/** The estimated cost for the delivery option. */
	estimatedCost: ModelTypes["MoneyV2"],
	/** The unique identifier of the delivery option. */
	handle: string,
	/** The title of the delivery option. */
	title?: string | undefined
};
	/** The discounts that have been applied to the cart line. */
["CartDiscountAllocation"]: ModelTypes["CartAutomaticDiscountAllocation"] | ModelTypes["CartCodeDiscountAllocation"] | ModelTypes["CartCustomDiscountAllocation"];
	/** The discount codes applied to the cart. */
["CartDiscountCode"]: {
		/** Whether the discount code is applicable to the cart's current contents. */
	applicable: boolean,
	/** The code for the discount. */
	code: string
};
	/** Return type for `cartDiscountCodesUpdate` mutation. */
["CartDiscountCodesUpdatePayload"]: {
		/** The updated cart. */
	cart?: ModelTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CartUserError"]>
};
	["CartErrorCode"]:CartErrorCode;
	/** The estimated costs that the buyer will pay at checkout.
The estimated cost uses
[`CartBuyerIdentity`](https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity)
to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
["CartEstimatedCost"]: {
		/** The estimated amount, before taxes and discounts, for the customer to pay at checkout. The checkout charge amount doesn't include any deferred payments that'll be paid at a later date. If the cart has no deferred payments, then the checkout charge amount is equivalent to`subtotal_amount`. */
	checkoutChargeAmount: ModelTypes["MoneyV2"],
	/** The estimated amount, before taxes and discounts, for the customer to pay. */
	subtotalAmount: ModelTypes["MoneyV2"],
	/** The estimated total amount for the customer to pay. */
	totalAmount: ModelTypes["MoneyV2"],
	/** The estimated duty amount for the customer to pay at checkout. */
	totalDutyAmount?: ModelTypes["MoneyV2"] | undefined,
	/** The estimated tax amount for the customer to pay at checkout. */
	totalTaxAmount?: ModelTypes["MoneyV2"] | undefined
};
	/** The input fields to create a cart. */
["CartInput"]: {
	/** An array of key-value pairs that contains additional information about the cart. */
	attributes?: Array<ModelTypes["AttributeInput"]> | undefined,
	/** A list of merchandise lines to add to the cart. */
	lines?: Array<ModelTypes["CartLineInput"]> | undefined,
	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes?: Array<string> | undefined,
	/** A note that is associated with the cart. For example, the note can be a personalized message to the buyer. */
	note?: string | undefined,
	/** The customer associated with the cart. Used to determine [international pricing]
(https://shopify.dev/custom-storefronts/internationalization/international-pricing).
Buyer identity should match the customer's shipping address.
 */
	buyerIdentity?: ModelTypes["CartBuyerIdentityInput"] | undefined
};
	/** Represents information about the merchandise in the cart. */
["CartLine"]: {
		/** An attribute associated with the cart line. */
	attribute?: ModelTypes["Attribute"] | undefined,
	/** The attributes associated with the cart line. Attributes are represented as key-value pairs. */
	attributes: Array<ModelTypes["Attribute"]>,
	/** The cost of the merchandise that the buyer will pay for at checkout. The costs are subject to change and changes will be reflected at checkout. */
	cost: ModelTypes["CartLineCost"],
	/** The discounts that have been applied to the cart line. */
	discountAllocations: Array<ModelTypes["CartDiscountAllocation"]>,
	/** The estimated cost of the merchandise that the buyer will pay for at checkout. The estimated costs are subject to change and changes will be reflected at checkout. */
	estimatedCost: ModelTypes["CartLineEstimatedCost"],
	/** A globally-unique ID. */
	id: string,
	/** The merchandise that the buyer intends to purchase. */
	merchandise: ModelTypes["Merchandise"],
	/** The quantity of the merchandise that the customer intends to purchase. */
	quantity: number,
	/** The selling plan associated with the cart line and the effect that each selling plan has on variants when they're purchased. */
	sellingPlanAllocation?: ModelTypes["SellingPlanAllocation"] | undefined
};
	/** An auto-generated type for paginating through multiple CartLines.
 */
["CartLineConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["CartLineEdge"]>,
	/** A list of the nodes contained in CartLineEdge. */
	nodes: Array<ModelTypes["CartLine"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** The cost of the merchandise line that the buyer will pay at checkout. */
["CartLineCost"]: {
		/** The amount of the merchandise line. */
	amountPerQuantity: ModelTypes["MoneyV2"],
	/** The compare at amount of the merchandise line. */
	compareAtAmountPerQuantity?: ModelTypes["MoneyV2"] | undefined,
	/** The cost of the merchandise line before line-level discounts. */
	subtotalAmount: ModelTypes["MoneyV2"],
	/** The total cost of the merchandise line. */
	totalAmount: ModelTypes["MoneyV2"]
};
	/** An auto-generated type which holds one CartLine and a cursor during pagination.
 */
["CartLineEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CartLineEdge. */
	node: ModelTypes["CartLine"]
};
	/** The estimated cost of the merchandise line that the buyer will pay at checkout. */
["CartLineEstimatedCost"]: {
		/** The amount of the merchandise line. */
	amount: ModelTypes["MoneyV2"],
	/** The compare at amount of the merchandise line. */
	compareAtAmount?: ModelTypes["MoneyV2"] | undefined,
	/** The estimated cost of the merchandise line before discounts. */
	subtotalAmount: ModelTypes["MoneyV2"],
	/** The estimated total cost of the merchandise line. */
	totalAmount: ModelTypes["MoneyV2"]
};
	/** The input fields to create a merchandise line on a cart. */
["CartLineInput"]: {
	/** An array of key-value pairs that contains additional information about the merchandise line. */
	attributes?: Array<ModelTypes["AttributeInput"]> | undefined,
	/** The quantity of the merchandise. */
	quantity?: number | undefined,
	/** The ID of the merchandise that the buyer intends to purchase. */
	merchandiseId: string,
	/** The ID of the selling plan that the merchandise is being purchased with. */
	sellingPlanId?: string | undefined
};
	/** The input fields to update a line item on a cart. */
["CartLineUpdateInput"]: {
	/** The ID of the merchandise line. */
	id: string,
	/** The quantity of the line item. */
	quantity?: number | undefined,
	/** The ID of the merchandise for the line item. */
	merchandiseId?: string | undefined,
	/** An array of key-value pairs that contains additional information about the merchandise line. */
	attributes?: Array<ModelTypes["AttributeInput"]> | undefined,
	/** The ID of the selling plan that the merchandise is being purchased with. */
	sellingPlanId?: string | undefined
};
	/** Return type for `cartLinesAdd` mutation. */
["CartLinesAddPayload"]: {
		/** The updated cart. */
	cart?: ModelTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CartUserError"]>
};
	/** Return type for `cartLinesRemove` mutation. */
["CartLinesRemovePayload"]: {
		/** The updated cart. */
	cart?: ModelTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CartUserError"]>
};
	/** Return type for `cartLinesUpdate` mutation. */
["CartLinesUpdatePayload"]: {
		/** The updated cart. */
	cart?: ModelTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CartUserError"]>
};
	/** Return type for `cartNoteUpdate` mutation. */
["CartNoteUpdatePayload"]: {
		/** The updated cart. */
	cart?: ModelTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CartUserError"]>
};
	/** The input fields for updating the selected delivery options for a delivery group.
 */
["CartSelectedDeliveryOptionInput"]: {
	/** The ID of the cart delivery group. */
	deliveryGroupId: string,
	/** The handle of the selected delivery option. */
	deliveryOptionHandle: string
};
	/** Return type for `cartSelectedDeliveryOptionsUpdate` mutation. */
["CartSelectedDeliveryOptionsUpdatePayload"]: {
		/** The updated cart. */
	cart?: ModelTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CartUserError"]>
};
	/** Represents an error that happens during execution of a cart mutation. */
["CartUserError"]: {
		/** The error code. */
	code?: ModelTypes["CartErrorCode"] | undefined,
	/** The path to the input field that caused the error. */
	field?: Array<string> | undefined,
	/** The error message. */
	message: string
};
	/** A container for all the information required to checkout items and pay. */
["Checkout"]: {
		/** The gift cards used on the checkout. */
	appliedGiftCards: Array<ModelTypes["AppliedGiftCard"]>,
	/** The available shipping rates for this Checkout.
Should only be used when checkout `requiresShipping` is `true` and
the shipping address is valid.
 */
	availableShippingRates?: ModelTypes["AvailableShippingRates"] | undefined,
	/** The identity of the customer associated with the checkout. */
	buyerIdentity: ModelTypes["CheckoutBuyerIdentity"],
	/** The date and time when the checkout was completed. */
	completedAt?: ModelTypes["DateTime"] | undefined,
	/** The date and time when the checkout was created. */
	createdAt: ModelTypes["DateTime"],
	/** The currency code for the checkout. */
	currencyCode: ModelTypes["CurrencyCode"],
	/** A list of extra information that is added to the checkout. */
	customAttributes: Array<ModelTypes["Attribute"]>,
	/** Discounts that have been applied on the checkout. */
	discountApplications: ModelTypes["DiscountApplicationConnection"],
	/** The email attached to this checkout. */
	email?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** A list of line item objects, each one containing information about an item in the checkout. */
	lineItems: ModelTypes["CheckoutLineItemConnection"],
	/** The sum of all the prices of all the items in the checkout. Duties, taxes, shipping and discounts excluded. */
	lineItemsSubtotalPrice: ModelTypes["MoneyV2"],
	/** The note associated with the checkout. */
	note?: string | undefined,
	/** The resulting order from a paid checkout. */
	order?: ModelTypes["Order"] | undefined,
	/** The Order Status Page for this Checkout, null when checkout is not completed. */
	orderStatusUrl?: ModelTypes["URL"] | undefined,
	/** The amount left to be paid. This is equal to the cost of the line items, taxes, and shipping, minus discounts and gift cards. */
	paymentDue: ModelTypes["MoneyV2"],
	/** The amount left to be paid. This is equal to the cost of the line items, duties, taxes, and shipping, minus discounts and gift cards. */
	paymentDueV2: ModelTypes["MoneyV2"],
	/** Whether or not the Checkout is ready and can be completed. Checkouts may
have asynchronous operations that can take time to finish. If you want
to complete a checkout or ensure all the fields are populated and up to
date, polling is required until the value is true.
 */
	ready: boolean,
	/** States whether or not the fulfillment requires shipping. */
	requiresShipping: boolean,
	/** The shipping address to where the line items will be shipped. */
	shippingAddress?: ModelTypes["MailingAddress"] | undefined,
	/** The discounts that have been allocated onto the shipping line by discount applications.
 */
	shippingDiscountAllocations: Array<ModelTypes["DiscountAllocation"]>,
	/** Once a shipping rate is selected by the customer it is transitioned to a `shipping_line` object. */
	shippingLine?: ModelTypes["ShippingRate"] | undefined,
	/** The price at checkout before shipping and taxes. */
	subtotalPrice: ModelTypes["MoneyV2"],
	/** The price at checkout before duties, shipping, and taxes. */
	subtotalPriceV2: ModelTypes["MoneyV2"],
	/** Whether the checkout is tax exempt. */
	taxExempt: boolean,
	/** Whether taxes are included in the line item and shipping line prices. */
	taxesIncluded: boolean,
	/** The sum of all the duties applied to the line items in the checkout. */
	totalDuties?: ModelTypes["MoneyV2"] | undefined,
	/** The sum of all the prices of all the items in the checkout, including taxes and duties. */
	totalPrice: ModelTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the checkout, including taxes and duties. */
	totalPriceV2: ModelTypes["MoneyV2"],
	/** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
	totalTax: ModelTypes["MoneyV2"],
	/** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
	totalTaxV2: ModelTypes["MoneyV2"],
	/** The date and time when the checkout was last updated. */
	updatedAt: ModelTypes["DateTime"],
	/** The url pointing to the checkout accessible from the web. */
	webUrl: ModelTypes["URL"]
};
	/** The input fields required to update a checkout's attributes. */
["CheckoutAttributesUpdateV2Input"]: {
	/** The text of an optional note that a shop owner can attach to the checkout. */
	note?: string | undefined,
	/** A list of extra information that is added to the checkout. */
	customAttributes?: Array<ModelTypes["AttributeInput"]> | undefined,
	/** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
The required attributes are city, province, and country.
Full validation of the addresses is still done at completion time. Defaults to `false` with 
each operation.
 */
	allowPartialAddresses?: boolean | undefined
};
	/** Return type for `checkoutAttributesUpdateV2` mutation. */
["CheckoutAttributesUpdateV2Payload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** The identity of the customer associated with the checkout. */
["CheckoutBuyerIdentity"]: {
		/** The country code for the checkout. For example, `CA`. */
	countryCode?: ModelTypes["CountryCode"] | undefined
};
	/** The input fields for the identity of the customer associated with the checkout. */
["CheckoutBuyerIdentityInput"]: {
	/** The country code of one of the shop's
[enabled countries](https://help.shopify.com/en/manual/payments/shopify-payments/multi-currency/setup).
For example, `CA`. Including this field creates a checkout in the specified country's currency.
 */
	countryCode: ModelTypes["CountryCode"]
};
	/** Return type for `checkoutCompleteFree` mutation. */
["CheckoutCompleteFreePayload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutCompleteWithCreditCardV2` mutation. */
["CheckoutCompleteWithCreditCardV2Payload"]: {
		/** The checkout on which the payment was applied. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** A representation of the attempted payment. */
	payment?: ModelTypes["Payment"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutCompleteWithTokenizedPaymentV3` mutation. */
["CheckoutCompleteWithTokenizedPaymentV3Payload"]: {
		/** The checkout on which the payment was applied. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** A representation of the attempted payment. */
	payment?: ModelTypes["Payment"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** The input fields required to create a checkout. */
["CheckoutCreateInput"]: {
	/** The email with which the customer wants to checkout. */
	email?: string | undefined,
	/** A list of line item objects, each one containing information about an item in the checkout. */
	lineItems?: Array<ModelTypes["CheckoutLineItemInput"]> | undefined,
	/** The shipping address to where the line items will be shipped. */
	shippingAddress?: ModelTypes["MailingAddressInput"] | undefined,
	/** The text of an optional note that a shop owner can attach to the checkout. */
	note?: string | undefined,
	/** A list of extra information that is added to the checkout. */
	customAttributes?: Array<ModelTypes["AttributeInput"]> | undefined,
	/** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
The required attributes are city, province, and country.
Full validation of addresses is still done at completion time. Defaults to `null`.
 */
	allowPartialAddresses?: boolean | undefined,
	/** The identity of the customer associated with the checkout. */
	buyerIdentity?: ModelTypes["CheckoutBuyerIdentityInput"] | undefined
};
	/** Return type for `checkoutCreate` mutation. */
["CheckoutCreatePayload"]: {
		/** The new checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The checkout queue token. Available only to selected stores. */
	queueToken?: string | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutCustomerAssociateV2` mutation. */
["CheckoutCustomerAssociateV2Payload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The associated customer object. */
	customer?: ModelTypes["Customer"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutCustomerDisassociateV2` mutation. */
["CheckoutCustomerDisassociateV2Payload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutDiscountCodeApplyV2` mutation. */
["CheckoutDiscountCodeApplyV2Payload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutDiscountCodeRemove` mutation. */
["CheckoutDiscountCodeRemovePayload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutEmailUpdateV2` mutation. */
["CheckoutEmailUpdateV2Payload"]: {
		/** The checkout object with the updated email. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	["CheckoutErrorCode"]:CheckoutErrorCode;
	/** Return type for `checkoutGiftCardRemoveV2` mutation. */
["CheckoutGiftCardRemoveV2Payload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutGiftCardsAppend` mutation. */
["CheckoutGiftCardsAppendPayload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** A single line item in the checkout, grouped by variant and attributes. */
["CheckoutLineItem"]: {
		/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes: Array<ModelTypes["Attribute"]>,
	/** The discounts that have been allocated onto the checkout line item by discount applications. */
	discountAllocations: Array<ModelTypes["DiscountAllocation"]>,
	/** A globally-unique ID. */
	id: string,
	/** The quantity of the line item. */
	quantity: number,
	/** Title of the line item. Defaults to the product's title. */
	title: string,
	/** Unit price of the line item. */
	unitPrice?: ModelTypes["MoneyV2"] | undefined,
	/** Product variant of the line item. */
	variant?: ModelTypes["ProductVariant"] | undefined
};
	/** An auto-generated type for paginating through multiple CheckoutLineItems.
 */
["CheckoutLineItemConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["CheckoutLineItemEdge"]>,
	/** A list of the nodes contained in CheckoutLineItemEdge. */
	nodes: Array<ModelTypes["CheckoutLineItem"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one CheckoutLineItem and a cursor during pagination.
 */
["CheckoutLineItemEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CheckoutLineItemEdge. */
	node: ModelTypes["CheckoutLineItem"]
};
	/** The input fields to create a line item on a checkout. */
["CheckoutLineItemInput"]: {
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?: Array<ModelTypes["AttributeInput"]> | undefined,
	/** The quantity of the line item. */
	quantity: number,
	/** The ID of the product variant for the line item. */
	variantId: string
};
	/** The input fields to update a line item on the checkout. */
["CheckoutLineItemUpdateInput"]: {
	/** The ID of the line item. */
	id?: string | undefined,
	/** The variant ID of the line item. */
	variantId?: string | undefined,
	/** The quantity of the line item. */
	quantity?: number | undefined,
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?: Array<ModelTypes["AttributeInput"]> | undefined
};
	/** Return type for `checkoutLineItemsAdd` mutation. */
["CheckoutLineItemsAddPayload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutLineItemsRemove` mutation. */
["CheckoutLineItemsRemovePayload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutLineItemsReplace` mutation. */
["CheckoutLineItemsReplacePayload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["CheckoutUserError"]>
};
	/** Return type for `checkoutLineItemsUpdate` mutation. */
["CheckoutLineItemsUpdatePayload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutShippingAddressUpdateV2` mutation. */
["CheckoutShippingAddressUpdateV2Payload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `checkoutShippingLineUpdate` mutation. */
["CheckoutShippingLineUpdatePayload"]: {
		/** The updated checkout object. */
	checkout?: ModelTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<ModelTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Represents an error that happens during execution of a checkout mutation. */
["CheckoutUserError"]: {
		/** The error code. */
	code?: ModelTypes["CheckoutErrorCode"] | undefined,
	/** The path to the input field that caused the error. */
	field?: Array<string> | undefined,
	/** The error message. */
	message: string
};
	/** A collection represents a grouping of products that a shop owner can create to organize them or make their shops easier to browse. */
["Collection"]: {
		/** Stripped description of the collection, single line with HTML tags removed. */
	description: string,
	/** The description of the collection, complete with HTML formatting. */
	descriptionHtml: ModelTypes["HTML"],
	/** A human-friendly unique string for the collection automatically generated from its title.
Limit of 255 characters.
 */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** Image associated with the collection. */
	image?: ModelTypes["Image"] | undefined,
	/** Returns a metafield found by namespace and key. */
	metafield?: ModelTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<ModelTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: ModelTypes["URL"] | undefined,
	/** List of products in the collection. */
	products: ModelTypes["ProductConnection"],
	/** The collection's SEO information. */
	seo: ModelTypes["SEO"],
	/** The collection’s name. Limit of 255 characters. */
	title: string,
	/** The date and time when the collection was last modified. */
	updatedAt: ModelTypes["DateTime"]
};
	/** An auto-generated type for paginating through multiple Collections.
 */
["CollectionConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["CollectionEdge"]>,
	/** A list of the nodes contained in CollectionEdge. */
	nodes: Array<ModelTypes["Collection"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one Collection and a cursor during pagination.
 */
["CollectionEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CollectionEdge. */
	node: ModelTypes["Collection"]
};
	["CollectionSortKeys"]:CollectionSortKeys;
	/** A string containing a hexadecimal representation of a color.

For example, "#6A8D48".
 */
["Color"]:any;
	/** A comment on an article. */
["Comment"]: {
		/** The comment’s author. */
	author: ModelTypes["CommentAuthor"],
	/** Stripped content of the comment, single line with HTML tags removed. */
	content: string,
	/** The content of the comment, complete with HTML formatting. */
	contentHtml: ModelTypes["HTML"],
	/** A globally-unique ID. */
	id: string
};
	/** The author of a comment. */
["CommentAuthor"]: {
		/** The author's email. */
	email: string,
	/** The author’s name. */
	name: string
};
	/** An auto-generated type for paginating through multiple Comments.
 */
["CommentConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["CommentEdge"]>,
	/** A list of the nodes contained in CommentEdge. */
	nodes: Array<ModelTypes["Comment"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one Comment and a cursor during pagination.
 */
["CommentEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CommentEdge. */
	node: ModelTypes["Comment"]
};
	/** A country. */
["Country"]: {
		/** The languages available for the country. */
	availableLanguages: Array<ModelTypes["Language"]>,
	/** The currency of the country. */
	currency: ModelTypes["Currency"],
	/** The ISO code of the country. */
	isoCode: ModelTypes["CountryCode"],
	/** The name of the country. */
	name: string,
	/** The unit system used in the country. */
	unitSystem: ModelTypes["UnitSystem"]
};
	["CountryCode"]:CountryCode;
	/** Credit card information used for a payment. */
["CreditCard"]: {
		/** The brand of the credit card. */
	brand?: string | undefined,
	/** The expiry month of the credit card. */
	expiryMonth?: number | undefined,
	/** The expiry year of the credit card. */
	expiryYear?: number | undefined,
	/** The credit card's BIN number. */
	firstDigits?: string | undefined,
	/** The first name of the card holder. */
	firstName?: string | undefined,
	/** The last 4 digits of the credit card. */
	lastDigits?: string | undefined,
	/** The last name of the card holder. */
	lastName?: string | undefined,
	/** The masked credit card number with only the last 4 digits displayed. */
	maskedNumber?: string | undefined
};
	/** Specifies the fields required to complete a checkout with
a Shopify vaulted credit card payment.
 */
["CreditCardPaymentInputV2"]: {
	/** The amount and currency of the payment. */
	paymentAmount: ModelTypes["MoneyInput"],
	/** A unique client generated key used to avoid duplicate charges. When a duplicate payment is found, the original is returned instead of creating a new one. For more information, refer to [Idempotent requests](https://shopify.dev/api/usage/idempotent-requests). */
	idempotencyKey: string,
	/** The billing address for the payment. */
	billingAddress: ModelTypes["MailingAddressInput"],
	/** The ID returned by Shopify's Card Vault. */
	vaultId: string,
	/** Executes the payment in test mode if possible. Defaults to `false`. */
	test?: boolean | undefined
};
	["CropRegion"]:CropRegion;
	/** A currency. */
["Currency"]: {
		/** The ISO code of the currency. */
	isoCode: ModelTypes["CurrencyCode"],
	/** The name of the currency. */
	name: string,
	/** The symbol of the currency. */
	symbol: string
};
	["CurrencyCode"]:CurrencyCode;
	/** A customer represents a customer account with the shop. Customer accounts store contact information for the customer, saving logged-in customers the trouble of having to provide it at every checkout. */
["Customer"]: {
		/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing: boolean,
	/** A list of addresses for the customer. */
	addresses: ModelTypes["MailingAddressConnection"],
	/** The date and time when the customer was created. */
	createdAt: ModelTypes["DateTime"],
	/** The customer’s default address. */
	defaultAddress?: ModelTypes["MailingAddress"] | undefined,
	/** The customer’s name, email or phone number. */
	displayName: string,
	/** The customer’s email address. */
	email?: string | undefined,
	/** The customer’s first name. */
	firstName?: string | undefined,
	/** A unique ID for the customer. */
	id: string,
	/** The customer's most recently updated, incomplete checkout. */
	lastIncompleteCheckout?: ModelTypes["Checkout"] | undefined,
	/** The customer’s last name. */
	lastName?: string | undefined,
	/** Returns a metafield found by namespace and key. */
	metafield?: ModelTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<ModelTypes["Metafield"] | undefined>,
	/** The number of orders that the customer has made at the store in their lifetime. */
	numberOfOrders: ModelTypes["UnsignedInt64"],
	/** The orders associated with the customer. */
	orders: ModelTypes["OrderConnection"],
	/** The customer’s phone number. */
	phone?: string | undefined,
	/** A comma separated list of tags that have been added to the customer.
Additional access scope required: unauthenticated_read_customer_tags.
 */
	tags: Array<string>,
	/** The date and time when the customer information was updated. */
	updatedAt: ModelTypes["DateTime"]
};
	/** A CustomerAccessToken represents the unique token required to make modifications to the customer object. */
["CustomerAccessToken"]: {
		/** The customer’s access token. */
	accessToken: string,
	/** The date and time when the customer access token expires. */
	expiresAt: ModelTypes["DateTime"]
};
	/** The input fields required to create a customer access token. */
["CustomerAccessTokenCreateInput"]: {
	/** The email associated to the customer. */
	email: string,
	/** The login password to be used by the customer. */
	password: string
};
	/** Return type for `customerAccessTokenCreate` mutation. */
["CustomerAccessTokenCreatePayload"]: {
		/** The newly created customer access token object. */
	customerAccessToken?: ModelTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `customerAccessTokenCreateWithMultipass` mutation. */
["CustomerAccessTokenCreateWithMultipassPayload"]: {
		/** An access token object associated with the customer. */
	customerAccessToken?: ModelTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>
};
	/** Return type for `customerAccessTokenDelete` mutation. */
["CustomerAccessTokenDeletePayload"]: {
		/** The destroyed access token. */
	deletedAccessToken?: string | undefined,
	/** ID of the destroyed customer access token. */
	deletedCustomerAccessTokenId?: string | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `customerAccessTokenRenew` mutation. */
["CustomerAccessTokenRenewPayload"]: {
		/** The renewed customer access token object. */
	customerAccessToken?: ModelTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `customerActivateByUrl` mutation. */
["CustomerActivateByUrlPayload"]: {
		/** The customer that was activated. */
	customer?: ModelTypes["Customer"] | undefined,
	/** A new customer access token for the customer. */
	customerAccessToken?: ModelTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>
};
	/** The input fields to activate a customer. */
["CustomerActivateInput"]: {
	/** The activation token required to activate the customer. */
	activationToken: string,
	/** New password that will be set during activation. */
	password: string
};
	/** Return type for `customerActivate` mutation. */
["CustomerActivatePayload"]: {
		/** The customer object. */
	customer?: ModelTypes["Customer"] | undefined,
	/** A newly created customer access token object for the customer. */
	customerAccessToken?: ModelTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `customerAddressCreate` mutation. */
["CustomerAddressCreatePayload"]: {
		/** The new customer address object. */
	customerAddress?: ModelTypes["MailingAddress"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `customerAddressDelete` mutation. */
["CustomerAddressDeletePayload"]: {
		/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** ID of the deleted customer address. */
	deletedCustomerAddressId?: string | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `customerAddressUpdate` mutation. */
["CustomerAddressUpdatePayload"]: {
		/** The customer’s updated mailing address. */
	customerAddress?: ModelTypes["MailingAddress"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** The input fields to create a new customer. */
["CustomerCreateInput"]: {
	/** The customer’s first name. */
	firstName?: string | undefined,
	/** The customer’s last name. */
	lastName?: string | undefined,
	/** The customer’s email. */
	email: string,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined,
	/** The login password used by the customer. */
	password: string,
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?: boolean | undefined
};
	/** Return type for `customerCreate` mutation. */
["CustomerCreatePayload"]: {
		/** The created customer object. */
	customer?: ModelTypes["Customer"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `customerDefaultAddressUpdate` mutation. */
["CustomerDefaultAddressUpdatePayload"]: {
		/** The updated customer object. */
	customer?: ModelTypes["Customer"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	["CustomerErrorCode"]:CustomerErrorCode;
	/** Return type for `customerRecover` mutation. */
["CustomerRecoverPayload"]: {
		/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Return type for `customerResetByUrl` mutation. */
["CustomerResetByUrlPayload"]: {
		/** The customer object which was reset. */
	customer?: ModelTypes["Customer"] | undefined,
	/** A newly created customer access token object for the customer. */
	customerAccessToken?: ModelTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** The input fields to reset a customer's password. */
["CustomerResetInput"]: {
	/** The reset token required to reset the customer’s password. */
	resetToken: string,
	/** New password that will be set as part of the reset password process. */
	password: string
};
	/** Return type for `customerReset` mutation. */
["CustomerResetPayload"]: {
		/** The customer object which was reset. */
	customer?: ModelTypes["Customer"] | undefined,
	/** A newly created customer access token object for the customer. */
	customerAccessToken?: ModelTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** The input fields to update the Customer information. */
["CustomerUpdateInput"]: {
	/** The customer’s first name. */
	firstName?: string | undefined,
	/** The customer’s last name. */
	lastName?: string | undefined,
	/** The customer’s email. */
	email?: string | undefined,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_. To remove the phone number, specify `null`.
 */
	phone?: string | undefined,
	/** The login password used by the customer. */
	password?: string | undefined,
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?: boolean | undefined
};
	/** Return type for `customerUpdate` mutation. */
["CustomerUpdatePayload"]: {
		/** The updated customer object. */
	customer?: ModelTypes["Customer"] | undefined,
	/** The newly created customer access token. If the customer's password is updated, all previous access tokens
(including the one used to perform this mutation) become invalid, and a new token is generated.
 */
	customerAccessToken?: ModelTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<ModelTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<ModelTypes["UserError"]>
};
	/** Represents an error that happens during execution of a customer mutation. */
["CustomerUserError"]: {
		/** The error code. */
	code?: ModelTypes["CustomerErrorCode"] | undefined,
	/** The path to the input field that caused the error. */
	field?: Array<string> | undefined,
	/** The error message. */
	message: string
};
	/** Represents an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)-encoded date and time string.
For example, 3:50 pm on September 7, 2019 in the time zone of UTC (Coordinated Universal Time) is
represented as `"2019-09-07T15:50:00Z`".
 */
["DateTime"]:any;
	/** A signed decimal number, which supports arbitrary precision and is serialized as a string.

Example values: `"29.99"`, `"29.999"`.
 */
["Decimal"]:any;
	/** A delivery address of the buyer that is interacting with the cart. */
["DeliveryAddress"]:ModelTypes["MailingAddress"];
	/** The input fields for delivery address preferences.
 */
["DeliveryAddressInput"]: {
	/** A delivery address preference of a buyer that is interacting with the cart. */
	deliveryAddress?: ModelTypes["MailingAddressInput"] | undefined
};
	["DeliveryMethodType"]:DeliveryMethodType;
	["DigitalWallet"]:DigitalWallet;
	/** An amount discounting the line that has been allocated by a discount.
 */
["DiscountAllocation"]: {
		/** Amount of discount allocated. */
	allocatedAmount: ModelTypes["MoneyV2"],
	/** The discount this allocated amount originated from. */
	discountApplication: ModelTypes["DiscountApplication"]
};
	/** Discount applications capture the intentions of a discount source at
the time of application.
 */
["DiscountApplication"]: ModelTypes["AutomaticDiscountApplication"] | ModelTypes["DiscountCodeApplication"] | ModelTypes["ManualDiscountApplication"] | ModelTypes["ScriptDiscountApplication"];
	["DiscountApplicationAllocationMethod"]:DiscountApplicationAllocationMethod;
	/** An auto-generated type for paginating through multiple DiscountApplications.
 */
["DiscountApplicationConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["DiscountApplicationEdge"]>,
	/** A list of the nodes contained in DiscountApplicationEdge. */
	nodes: Array<ModelTypes["DiscountApplication"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one DiscountApplication and a cursor during pagination.
 */
["DiscountApplicationEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of DiscountApplicationEdge. */
	node: ModelTypes["DiscountApplication"]
};
	["DiscountApplicationTargetSelection"]:DiscountApplicationTargetSelection;
	["DiscountApplicationTargetType"]:DiscountApplicationTargetType;
	/** Discount code applications capture the intentions of a discount code at
the time that it is applied.
 */
["DiscountCodeApplication"]: {
		/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod: ModelTypes["DiscountApplicationAllocationMethod"],
	/** Specifies whether the discount code was applied successfully. */
	applicable: boolean,
	/** The string identifying the discount code that was used at the time of application. */
	code: string,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection: ModelTypes["DiscountApplicationTargetSelection"],
	/** The type of line that the discount is applicable towards. */
	targetType: ModelTypes["DiscountApplicationTargetType"],
	/** The value of the discount application. */
	value: ModelTypes["PricingValue"]
};
	/** Represents an error in the input of a mutation. */
["DisplayableError"]: ModelTypes["CartUserError"] | ModelTypes["CheckoutUserError"] | ModelTypes["CustomerUserError"] | ModelTypes["UserError"];
	/** Represents a web address. */
["Domain"]: {
		/** The host name of the domain (eg: `example.com`). */
	host: string,
	/** Whether SSL is enabled or not. */
	sslEnabled: boolean,
	/** The URL of the domain (eg: `https://example.com`). */
	url: ModelTypes["URL"]
};
	/** Represents a video hosted outside of Shopify. */
["ExternalVideo"]: {
		/** A word or phrase to share the nature or contents of a media. */
	alt?: string | undefined,
	/** The embed URL of the video for the respective host. */
	embedUrl: ModelTypes["URL"],
	/** The URL. */
	embeddedUrl: ModelTypes["URL"],
	/** The host of the external video. */
	host: ModelTypes["MediaHost"],
	/** A globally-unique ID. */
	id: string,
	/** The media content type. */
	mediaContentType: ModelTypes["MediaContentType"],
	/** The origin URL of the video on the respective host. */
	originUrl: ModelTypes["URL"],
	/** The preview image for the media. */
	previewImage?: ModelTypes["Image"] | undefined
};
	/** A filter that is supported on the parent field. */
["Filter"]: {
		/** A unique identifier. */
	id: string,
	/** A human-friendly string for this filter. */
	label: string,
	/** An enumeration that denotes the type of data this filter represents. */
	type: ModelTypes["FilterType"],
	/** The list of values for this filter. */
	values: Array<ModelTypes["FilterValue"]>
};
	["FilterType"]:FilterType;
	/** A selectable value within a filter. */
["FilterValue"]: {
		/** The number of results that match this filter value. */
	count: number,
	/** A unique identifier. */
	id: string,
	/** An input object that can be used to filter by this value on the parent field.

The value is provided as a helper for building dynamic filtering UI. For example, if you have a list of selected `FilterValue` objects, you can combine their respective `input` values to use in a subsequent query.
 */
	input: ModelTypes["JSON"],
	/** A human-friendly string for this filter value. */
	label: string
};
	/** Represents a single fulfillment in an order. */
["Fulfillment"]: {
		/** List of the fulfillment's line items. */
	fulfillmentLineItems: ModelTypes["FulfillmentLineItemConnection"],
	/** The name of the tracking company. */
	trackingCompany?: string | undefined,
	/** Tracking information associated with the fulfillment,
such as the tracking number and tracking URL.
 */
	trackingInfo: Array<ModelTypes["FulfillmentTrackingInfo"]>
};
	/** Represents a single line item in a fulfillment. There is at most one fulfillment line item for each order line item. */
["FulfillmentLineItem"]: {
		/** The associated order's line item. */
	lineItem: ModelTypes["OrderLineItem"],
	/** The amount fulfilled in this fulfillment. */
	quantity: number
};
	/** An auto-generated type for paginating through multiple FulfillmentLineItems.
 */
["FulfillmentLineItemConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["FulfillmentLineItemEdge"]>,
	/** A list of the nodes contained in FulfillmentLineItemEdge. */
	nodes: Array<ModelTypes["FulfillmentLineItem"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one FulfillmentLineItem and a cursor during pagination.
 */
["FulfillmentLineItemEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of FulfillmentLineItemEdge. */
	node: ModelTypes["FulfillmentLineItem"]
};
	/** Tracking information associated with the fulfillment. */
["FulfillmentTrackingInfo"]: {
		/** The tracking number of the fulfillment. */
	number?: string | undefined,
	/** The URL to track the fulfillment. */
	url?: ModelTypes["URL"] | undefined
};
	/** The generic file resource lets you manage files in a merchant’s store. Generic files include any file that doesn’t fit into a designated type such as image or video. Example: PDF, JSON. */
["GenericFile"]: {
		/** A word or phrase to indicate the contents of a file. */
	alt?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The MIME type of the file. */
	mimeType?: string | undefined,
	/** The size of the original file in bytes. */
	originalFileSize?: number | undefined,
	/** The preview image for the file. */
	previewImage?: ModelTypes["Image"] | undefined,
	/** The URL of the file. */
	url?: ModelTypes["URL"] | undefined
};
	/** The input fields used to specify a geographical location. */
["GeoCoordinateInput"]: {
	/** The coordinate's latitude value. */
	latitude: number,
	/** The coordinate's longitude value. */
	longitude: number
};
	/** A string containing HTML code. Refer to the [HTML spec](https://html.spec.whatwg.org/#elements-3) for a
complete list of HTML elements.

Example value: `"<p>Grey cotton knit sweater.</p>"`
 */
["HTML"]:any;
	/** Represents information about the metafields associated to the specified resource. */
["HasMetafields"]: ModelTypes["Article"] | ModelTypes["Blog"] | ModelTypes["Collection"] | ModelTypes["Customer"] | ModelTypes["Order"] | ModelTypes["Page"] | ModelTypes["Product"] | ModelTypes["ProductVariant"] | ModelTypes["Shop"];
	/** The input fields to identify a metafield on an owner resource by namespace and key. */
["HasMetafieldsIdentifier"]: {
	/** A container for a set of metafields. */
	namespace: string,
	/** The identifier for the metafield. */
	key: string
};
	/** Represents an image resource. */
["Image"]: {
		/** A word or phrase to share the nature or contents of an image. */
	altText?: string | undefined,
	/** The original height of the image in pixels. Returns `null` if the image is not hosted by Shopify. */
	height?: number | undefined,
	/** A unique ID for the image. */
	id?: string | undefined,
	/** The location of the original image as a URL.

If there are any existing transformations in the original source URL, they will remain and not be stripped.
 */
	originalSrc: ModelTypes["URL"],
	/** The location of the image as a URL. */
	src: ModelTypes["URL"],
	/** The location of the transformed image as a URL.

All transformation arguments are considered "best-effort". If they can be applied to an image, they will be.
Otherwise any transformations which an image type does not support will be ignored.
 */
	transformedSrc: ModelTypes["URL"],
	/** The location of the image as a URL.

If no transform options are specified, then the original image will be preserved including any pre-applied transforms.

All transformation options are considered "best-effort". Any transformation that the original image type doesn't support will be ignored.

If you need multiple variations of the same image, then you can use [GraphQL aliases](https://graphql.org/learn/queries/#aliases).
 */
	url: ModelTypes["URL"],
	/** The original width of the image in pixels. Returns `null` if the image is not hosted by Shopify. */
	width?: number | undefined
};
	/** An auto-generated type for paginating through multiple Images.
 */
["ImageConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["ImageEdge"]>,
	/** A list of the nodes contained in ImageEdge. */
	nodes: Array<ModelTypes["Image"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	["ImageContentType"]:ImageContentType;
	/** An auto-generated type which holds one Image and a cursor during pagination.
 */
["ImageEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of ImageEdge. */
	node: ModelTypes["Image"]
};
	/** The available options for transforming an image.

All transformation options are considered best effort. Any transformation that the original image type doesn't support will be ignored.
 */
["ImageTransformInput"]: {
	/** The region of the image to remain after cropping.
Must be used in conjunction with the `maxWidth` and/or `maxHeight` fields, where the `maxWidth` and `maxHeight` aren't equal.
The `crop` argument should coincide with the smaller value. A smaller `maxWidth` indicates a `LEFT` or `RIGHT` crop, while
a smaller `maxHeight` indicates a `TOP` or `BOTTOM` crop. For example, `{ maxWidth: 5, maxHeight: 10, crop: LEFT }` will result
in an image with a width of 5 and height of 10, where the right side of the image is removed.
 */
	crop?: ModelTypes["CropRegion"] | undefined,
	/** Image width in pixels between 1 and 5760.
 */
	maxWidth?: number | undefined,
	/** Image height in pixels between 1 and 5760.
 */
	maxHeight?: number | undefined,
	/** Image size multiplier for high-resolution retina displays. Must be within 1..3.
 */
	scale?: number | undefined,
	/** Convert the source image into the preferred content type.
Supported conversions: `.svg` to `.png`, any file type to `.jpg`, and any file type to `.webp`.
 */
	preferredContentType?: ModelTypes["ImageContentType"] | undefined
};
	/** A [JSON](https://www.json.org/json-en.html) object.

Example value:
`{
  "product": {
    "id": "gid://shopify/Product/1346443542550",
    "title": "White T-shirt",
    "options": [{
      "name": "Size",
      "values": ["M", "L"]
    }]
  }
}`
 */
["JSON"]:any;
	/** A language. */
["Language"]: {
		/** The name of the language in the language itself. If the language uses capitalization, it is capitalized for a mid-sentence position. */
	endonymName: string,
	/** The ISO code. */
	isoCode: ModelTypes["LanguageCode"],
	/** The name of the language in the current language. */
	name: string
};
	["LanguageCode"]:LanguageCode;
	/** Information about the localized experiences configured for the shop. */
["Localization"]: {
		/** The list of countries with enabled localized experiences. */
	availableCountries: Array<ModelTypes["Country"]>,
	/** The list of languages available for the active country. */
	availableLanguages: Array<ModelTypes["Language"]>,
	/** The country of the active localized experience. Use the `@inContext` directive to change this value. */
	country: ModelTypes["Country"],
	/** The language of the active localized experience. Use the `@inContext` directive to change this value. */
	language: ModelTypes["Language"]
};
	/** Represents a location where product inventory is held. */
["Location"]: {
		/** The address of the location. */
	address: ModelTypes["LocationAddress"],
	/** A globally-unique ID. */
	id: string,
	/** The name of the location. */
	name: string
};
	/** Represents the address of a location.
 */
["LocationAddress"]: {
		/** The first line of the address for the location. */
	address1?: string | undefined,
	/** The second line of the address for the location. */
	address2?: string | undefined,
	/** The city of the location. */
	city?: string | undefined,
	/** The country of the location. */
	country?: string | undefined,
	/** The country code of the location. */
	countryCode?: string | undefined,
	/** A formatted version of the address for the location. */
	formatted: Array<string>,
	/** The latitude coordinates of the location. */
	latitude?: number | undefined,
	/** The longitude coordinates of the location. */
	longitude?: number | undefined,
	/** The phone number of the location. */
	phone?: string | undefined,
	/** The province of the location. */
	province?: string | undefined,
	/** The code for the province, state, or district of the address of the location.
 */
	provinceCode?: string | undefined,
	/** The ZIP code of the location. */
	zip?: string | undefined
};
	/** An auto-generated type for paginating through multiple Locations.
 */
["LocationConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["LocationEdge"]>,
	/** A list of the nodes contained in LocationEdge. */
	nodes: Array<ModelTypes["Location"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one Location and a cursor during pagination.
 */
["LocationEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of LocationEdge. */
	node: ModelTypes["Location"]
};
	["LocationSortKeys"]:LocationSortKeys;
	/** Represents a mailing address for customers and shipping. */
["MailingAddress"]: {
		/** The first line of the address. Typically the street address or PO Box number. */
	address1?: string | undefined,
	/** The second line of the address. Typically the number of the apartment, suite, or unit.
 */
	address2?: string | undefined,
	/** The name of the city, district, village, or town.
 */
	city?: string | undefined,
	/** The name of the customer's company or organization.
 */
	company?: string | undefined,
	/** The name of the country.
 */
	country?: string | undefined,
	/** The two-letter code for the country of the address.

For example, US.
 */
	countryCode?: string | undefined,
	/** The two-letter code for the country of the address.

For example, US.
 */
	countryCodeV2?: ModelTypes["CountryCode"] | undefined,
	/** The first name of the customer. */
	firstName?: string | undefined,
	/** A formatted version of the address, customized by the provided arguments. */
	formatted: Array<string>,
	/** A comma-separated list of the values for city, province, and country. */
	formattedArea?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The last name of the customer. */
	lastName?: string | undefined,
	/** The latitude coordinate of the customer address. */
	latitude?: number | undefined,
	/** The longitude coordinate of the customer address. */
	longitude?: number | undefined,
	/** The full name of the customer, based on firstName and lastName.
 */
	name?: string | undefined,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined,
	/** The region of the address, such as the province, state, or district. */
	province?: string | undefined,
	/** The two-letter code for the region.

For example, ON.
 */
	provinceCode?: string | undefined,
	/** The zip or postal code of the address. */
	zip?: string | undefined
};
	/** An auto-generated type for paginating through multiple MailingAddresses.
 */
["MailingAddressConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["MailingAddressEdge"]>,
	/** A list of the nodes contained in MailingAddressEdge. */
	nodes: Array<ModelTypes["MailingAddress"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one MailingAddress and a cursor during pagination.
 */
["MailingAddressEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of MailingAddressEdge. */
	node: ModelTypes["MailingAddress"]
};
	/** The input fields to create or update a mailing address. */
["MailingAddressInput"]: {
	/** The first line of the address. Typically the street address or PO Box number.
 */
	address1?: string | undefined,
	/** The second line of the address. Typically the number of the apartment, suite, or unit.
 */
	address2?: string | undefined,
	/** The name of the city, district, village, or town.
 */
	city?: string | undefined,
	/** The name of the customer's company or organization.
 */
	company?: string | undefined,
	/** The name of the country. */
	country?: string | undefined,
	/** The first name of the customer. */
	firstName?: string | undefined,
	/** The last name of the customer. */
	lastName?: string | undefined,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined,
	/** The region of the address, such as the province, state, or district. */
	province?: string | undefined,
	/** The zip or postal code of the address. */
	zip?: string | undefined
};
	/** Manual discount applications capture the intentions of a discount that was manually created.
 */
["ManualDiscountApplication"]: {
		/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod: ModelTypes["DiscountApplicationAllocationMethod"],
	/** The description of the application. */
	description?: string | undefined,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection: ModelTypes["DiscountApplicationTargetSelection"],
	/** The type of line that the discount is applicable towards. */
	targetType: ModelTypes["DiscountApplicationTargetType"],
	/** The title of the application. */
	title: string,
	/** The value of the discount application. */
	value: ModelTypes["PricingValue"]
};
	/** Represents a media interface. */
["Media"]: ModelTypes["ExternalVideo"] | ModelTypes["MediaImage"] | ModelTypes["Model3d"] | ModelTypes["Video"];
	/** An auto-generated type for paginating through multiple Media.
 */
["MediaConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["MediaEdge"]>,
	/** A list of the nodes contained in MediaEdge. */
	nodes: Array<ModelTypes["Media"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	["MediaContentType"]:MediaContentType;
	/** An auto-generated type which holds one Media and a cursor during pagination.
 */
["MediaEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of MediaEdge. */
	node: ModelTypes["Media"]
};
	["MediaHost"]:MediaHost;
	/** Represents a Shopify hosted image. */
["MediaImage"]: {
		/** A word or phrase to share the nature or contents of a media. */
	alt?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The image for the media. */
	image?: ModelTypes["Image"] | undefined,
	/** The media content type. */
	mediaContentType: ModelTypes["MediaContentType"],
	/** The preview image for the media. */
	previewImage?: ModelTypes["Image"] | undefined
};
	/** A [navigation menu](https://help.shopify.com/manual/online-store/menus-and-links) representing a hierarchy
of hyperlinks (items).
 */
["Menu"]: {
		/** The menu's handle. */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** The menu's child items. */
	items: Array<ModelTypes["MenuItem"]>,
	/** The count of items on the menu. */
	itemsCount: number,
	/** The menu's title. */
	title: string
};
	/** A menu item within a parent menu.
 */
["MenuItem"]: {
		/** A globally-unique ID. */
	id: string,
	/** The menu item's child items. */
	items: Array<ModelTypes["MenuItem"]>,
	/** The ID of the linked resource. */
	resourceId?: string | undefined,
	/** The menu item's tags to filter a collection. */
	tags: Array<string>,
	/** The menu item's title. */
	title: string,
	/** The menu item's type. */
	type: ModelTypes["MenuItemType"],
	/** The menu item's URL. */
	url?: ModelTypes["URL"] | undefined
};
	["MenuItemType"]:MenuItemType;
	/** The merchandise to be purchased at checkout. */
["Merchandise"]:ModelTypes["ProductVariant"];
	/** Metafields represent custom metadata attached to a resource. Metafields can be sorted into namespaces and are
comprised of keys, values, and value types.
 */
["Metafield"]: {
		/** The date and time when the storefront metafield was created. */
	createdAt: ModelTypes["DateTime"],
	/** The description of a metafield. */
	description?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The unique identifier for the metafield within its namespace. */
	key: string,
	/** The container for a group of metafields that the metafield is associated with. */
	namespace: string,
	/** The type of resource that the metafield is attached to. */
	parentResource: ModelTypes["MetafieldParentResource"],
	/** Returns a reference object if the metafield's type is a resource reference. */
	reference?: ModelTypes["MetafieldReference"] | undefined,
	/** A list of reference objects if the metafield's type is a resource reference list. */
	references?: ModelTypes["MetafieldReferenceConnection"] | undefined,
	/** The type name of the metafield.
Refer to the list of [supported types](https://shopify.dev/apps/metafields/definitions/types).
 */
	type: string,
	/** The date and time when the metafield was last updated. */
	updatedAt: ModelTypes["DateTime"],
	/** The data stored in the metafield. Always stored as a string, regardless of the metafield's type. */
	value: string
};
	/** A filter used to view a subset of products in a collection matching a specific metafield value.

Only the following metafield types are currently supported:
- `number_integer`
- `number_decimal`
- `single_line_text_field`
- `boolean` as of 2022-04.
 */
["MetafieldFilter"]: {
	/** The namespace of the metafield to filter on. */
	namespace: string,
	/** The key of the metafield to filter on. */
	key: string,
	/** The value of the metafield. */
	value: string
};
	/** A resource that the metafield belongs to. */
["MetafieldParentResource"]:ModelTypes["Article"] | ModelTypes["Blog"] | ModelTypes["Collection"] | ModelTypes["Customer"] | ModelTypes["Order"] | ModelTypes["Page"] | ModelTypes["Product"] | ModelTypes["ProductVariant"] | ModelTypes["Shop"];
	/** Returns the resource which is being referred to by a metafield.
 */
["MetafieldReference"]:ModelTypes["Collection"] | ModelTypes["GenericFile"] | ModelTypes["MediaImage"] | ModelTypes["Metaobject"] | ModelTypes["Page"] | ModelTypes["Product"] | ModelTypes["ProductVariant"] | ModelTypes["Video"];
	/** An auto-generated type for paginating through multiple MetafieldReferences.
 */
["MetafieldReferenceConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["MetafieldReferenceEdge"]>,
	/** A list of the nodes contained in MetafieldReferenceEdge. */
	nodes: Array<ModelTypes["MetafieldReference"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one MetafieldReference and a cursor during pagination.
 */
["MetafieldReferenceEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of MetafieldReferenceEdge. */
	node: ModelTypes["MetafieldReference"]
};
	/** An instance of a user-defined model based on a MetaobjectDefinition. */
["Metaobject"]: {
		/** Accesses a field of the object by key. */
	field?: ModelTypes["MetaobjectField"] | undefined,
	/** All object fields with defined values.
Omitted object keys can be assumed null, and no guarantees are made about field order.
 */
	fields: Array<ModelTypes["MetaobjectField"]>,
	/** The unique handle of the metaobject. Useful as a custom ID. */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** The type of the metaobject. Defines the namespace of its associated metafields. */
	type: string,
	/** The date and time when the metaobject was last updated. */
	updatedAt: ModelTypes["DateTime"]
};
	/** An auto-generated type for paginating through multiple Metaobjects.
 */
["MetaobjectConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["MetaobjectEdge"]>,
	/** A list of the nodes contained in MetaobjectEdge. */
	nodes: Array<ModelTypes["Metaobject"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one Metaobject and a cursor during pagination.
 */
["MetaobjectEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of MetaobjectEdge. */
	node: ModelTypes["Metaobject"]
};
	/** Provides the value of a Metaobject field. */
["MetaobjectField"]: {
		/** The field key. */
	key: string,
	/** A referenced object if the field type is a resource reference. */
	reference?: ModelTypes["MetafieldReference"] | undefined,
	/** A list of referenced objects if the field type is a resource reference list. */
	references?: ModelTypes["MetafieldReferenceConnection"] | undefined,
	/** The type name of the field.
See the list of [supported types](https://shopify.dev/apps/metafields/definitions/types).
 */
	type: string,
	/** The field value. */
	value?: string | undefined
};
	/** The input fields used to retrieve a metaobject by handle. */
["MetaobjectHandleInput"]: {
	/** The handle of the metaobject. */
	handle: string,
	/** The type of the metaobject. */
	type: string
};
	/** Represents a Shopify hosted 3D model. */
["Model3d"]: {
		/** A word or phrase to share the nature or contents of a media. */
	alt?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The media content type. */
	mediaContentType: ModelTypes["MediaContentType"],
	/** The preview image for the media. */
	previewImage?: ModelTypes["Image"] | undefined,
	/** The sources for a 3d model. */
	sources: Array<ModelTypes["Model3dSource"]>
};
	/** Represents a source for a Shopify hosted 3d model. */
["Model3dSource"]: {
		/** The filesize of the 3d model. */
	filesize: number,
	/** The format of the 3d model. */
	format: string,
	/** The MIME type of the 3d model. */
	mimeType: string,
	/** The URL of the 3d model. */
	url: string
};
	/** The input fields for a monetary value with currency. */
["MoneyInput"]: {
	/** Decimal money amount. */
	amount: ModelTypes["Decimal"],
	/** Currency of the money. */
	currencyCode: ModelTypes["CurrencyCode"]
};
	/** A monetary value with currency.
 */
["MoneyV2"]: {
		/** Decimal money amount. */
	amount: ModelTypes["Decimal"],
	/** Currency of the money. */
	currencyCode: ModelTypes["CurrencyCode"]
};
	/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
["Mutation"]: {
		/** Updates the attributes on a cart. */
	cartAttributesUpdate?: ModelTypes["CartAttributesUpdatePayload"] | undefined,
	/** Updates customer information associated with a cart.
Buyer identity is used to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
and should match the customer's shipping address.
 */
	cartBuyerIdentityUpdate?: ModelTypes["CartBuyerIdentityUpdatePayload"] | undefined,
	/** Creates a new cart. */
	cartCreate?: ModelTypes["CartCreatePayload"] | undefined,
	/** Updates the discount codes applied to the cart. */
	cartDiscountCodesUpdate?: ModelTypes["CartDiscountCodesUpdatePayload"] | undefined,
	/** Adds a merchandise line to the cart. */
	cartLinesAdd?: ModelTypes["CartLinesAddPayload"] | undefined,
	/** Removes one or more merchandise lines from the cart. */
	cartLinesRemove?: ModelTypes["CartLinesRemovePayload"] | undefined,
	/** Updates one or more merchandise lines on a cart. */
	cartLinesUpdate?: ModelTypes["CartLinesUpdatePayload"] | undefined,
	/** Updates the note on the cart. */
	cartNoteUpdate?: ModelTypes["CartNoteUpdatePayload"] | undefined,
	/** Update the selected delivery options for a delivery group. */
	cartSelectedDeliveryOptionsUpdate?: ModelTypes["CartSelectedDeliveryOptionsUpdatePayload"] | undefined,
	/** Updates the attributes of a checkout if `allowPartialAddresses` is `true`. */
	checkoutAttributesUpdateV2?: ModelTypes["CheckoutAttributesUpdateV2Payload"] | undefined,
	/** Completes a checkout without providing payment information. You can use this mutation for free items or items whose purchase price is covered by a gift card. */
	checkoutCompleteFree?: ModelTypes["CheckoutCompleteFreePayload"] | undefined,
	/** Completes a checkout using a credit card token from Shopify's card vault. Before you can complete checkouts using CheckoutCompleteWithCreditCardV2, you need to  [_request payment processing_](https://shopify.dev/apps/channels/getting-started#request-payment-processing). */
	checkoutCompleteWithCreditCardV2?: ModelTypes["CheckoutCompleteWithCreditCardV2Payload"] | undefined,
	/** Completes a checkout with a tokenized payment. */
	checkoutCompleteWithTokenizedPaymentV3?: ModelTypes["CheckoutCompleteWithTokenizedPaymentV3Payload"] | undefined,
	/** Creates a new checkout. */
	checkoutCreate?: ModelTypes["CheckoutCreatePayload"] | undefined,
	/** Associates a customer to the checkout. */
	checkoutCustomerAssociateV2?: ModelTypes["CheckoutCustomerAssociateV2Payload"] | undefined,
	/** Disassociates the current checkout customer from the checkout. */
	checkoutCustomerDisassociateV2?: ModelTypes["CheckoutCustomerDisassociateV2Payload"] | undefined,
	/** Applies a discount to an existing checkout using a discount code. */
	checkoutDiscountCodeApplyV2?: ModelTypes["CheckoutDiscountCodeApplyV2Payload"] | undefined,
	/** Removes the applied discounts from an existing checkout. */
	checkoutDiscountCodeRemove?: ModelTypes["CheckoutDiscountCodeRemovePayload"] | undefined,
	/** Updates the email on an existing checkout. */
	checkoutEmailUpdateV2?: ModelTypes["CheckoutEmailUpdateV2Payload"] | undefined,
	/** Removes an applied gift card from the checkout. */
	checkoutGiftCardRemoveV2?: ModelTypes["CheckoutGiftCardRemoveV2Payload"] | undefined,
	/** Appends gift cards to an existing checkout. */
	checkoutGiftCardsAppend?: ModelTypes["CheckoutGiftCardsAppendPayload"] | undefined,
	/** Adds a list of line items to a checkout. */
	checkoutLineItemsAdd?: ModelTypes["CheckoutLineItemsAddPayload"] | undefined,
	/** Removes line items from an existing checkout. */
	checkoutLineItemsRemove?: ModelTypes["CheckoutLineItemsRemovePayload"] | undefined,
	/** Sets a list of line items to a checkout. */
	checkoutLineItemsReplace?: ModelTypes["CheckoutLineItemsReplacePayload"] | undefined,
	/** Updates line items on a checkout. */
	checkoutLineItemsUpdate?: ModelTypes["CheckoutLineItemsUpdatePayload"] | undefined,
	/** Updates the shipping address of an existing checkout. */
	checkoutShippingAddressUpdateV2?: ModelTypes["CheckoutShippingAddressUpdateV2Payload"] | undefined,
	/** Updates the shipping lines on an existing checkout. */
	checkoutShippingLineUpdate?: ModelTypes["CheckoutShippingLineUpdatePayload"] | undefined,
	/** Creates a customer access token.
The customer access token is required to modify the customer object in any way.
 */
	customerAccessTokenCreate?: ModelTypes["CustomerAccessTokenCreatePayload"] | undefined,
	/** Creates a customer access token using a
[multipass token](https://shopify.dev/api/multipass) instead of email and
password. A customer record is created if the customer doesn't exist. If a customer
record already exists but the record is disabled, then the customer record is enabled.
 */
	customerAccessTokenCreateWithMultipass?: ModelTypes["CustomerAccessTokenCreateWithMultipassPayload"] | undefined,
	/** Permanently destroys a customer access token. */
	customerAccessTokenDelete?: ModelTypes["CustomerAccessTokenDeletePayload"] | undefined,
	/** Renews a customer access token.

Access token renewal must happen *before* a token expires.
If a token has already expired, a new one should be created instead via `customerAccessTokenCreate`.
 */
	customerAccessTokenRenew?: ModelTypes["CustomerAccessTokenRenewPayload"] | undefined,
	/** Activates a customer. */
	customerActivate?: ModelTypes["CustomerActivatePayload"] | undefined,
	/** Activates a customer with the activation url received from `customerCreate`. */
	customerActivateByUrl?: ModelTypes["CustomerActivateByUrlPayload"] | undefined,
	/** Creates a new address for a customer. */
	customerAddressCreate?: ModelTypes["CustomerAddressCreatePayload"] | undefined,
	/** Permanently deletes the address of an existing customer. */
	customerAddressDelete?: ModelTypes["CustomerAddressDeletePayload"] | undefined,
	/** Updates the address of an existing customer. */
	customerAddressUpdate?: ModelTypes["CustomerAddressUpdatePayload"] | undefined,
	/** Creates a new customer. */
	customerCreate?: ModelTypes["CustomerCreatePayload"] | undefined,
	/** Updates the default address of an existing customer. */
	customerDefaultAddressUpdate?: ModelTypes["CustomerDefaultAddressUpdatePayload"] | undefined,
	/** Sends a reset password email to the customer. The reset password
email contains a reset password URL and token that you can pass to
the [`customerResetByUrl`](https://shopify.dev/api/storefront/latest/mutations/customerResetByUrl) or
[`customerReset`](https://shopify.dev/api/storefront/latest/mutations/customerReset) mutation to reset the
customer password.

This mutation is throttled by IP. With authenticated access,
you can provide a [`Shopify-Storefront-Buyer-IP`](https://shopify.dev/api/usage/authentication#optional-ip-header) instead of the request IP.

Make sure that the value provided to `Shopify-Storefront-Buyer-IP` is trusted. Unthrottled access to this
mutation presents a security risk.
 */
	customerRecover?: ModelTypes["CustomerRecoverPayload"] | undefined,
	/** "Resets a customer’s password with the token received from a reset password email. You can send a reset password email with the [`customerRecover`](https://shopify.dev/api/storefront/latest/mutations/customerRecover) mutation."
 */
	customerReset?: ModelTypes["CustomerResetPayload"] | undefined,
	/** "Resets a customer’s password with the reset password URL received from a reset password email. You can send a reset password email with the [`customerRecover`](https://shopify.dev/api/storefront/latest/mutations/customerRecover) mutation."
 */
	customerResetByUrl?: ModelTypes["CustomerResetByUrlPayload"] | undefined,
	/** Updates an existing customer. */
	customerUpdate?: ModelTypes["CustomerUpdatePayload"] | undefined
};
	/** An object with an ID field to support global identification, in accordance with the
[Relay specification](https://relay.dev/graphql/objectidentification.htm#sec-Node-Interface).
This interface is used by the [node](https://shopify.dev/api/admin-graphql/unstable/queries/node)
and [nodes](https://shopify.dev/api/admin-graphql/unstable/queries/nodes) queries.
 */
["Node"]: ModelTypes["AppliedGiftCard"] | ModelTypes["Article"] | ModelTypes["Blog"] | ModelTypes["Cart"] | ModelTypes["CartLine"] | ModelTypes["Checkout"] | ModelTypes["CheckoutLineItem"] | ModelTypes["Collection"] | ModelTypes["Comment"] | ModelTypes["ExternalVideo"] | ModelTypes["GenericFile"] | ModelTypes["Location"] | ModelTypes["MailingAddress"] | ModelTypes["MediaImage"] | ModelTypes["Menu"] | ModelTypes["MenuItem"] | ModelTypes["Metafield"] | ModelTypes["Metaobject"] | ModelTypes["Model3d"] | ModelTypes["Order"] | ModelTypes["Page"] | ModelTypes["Payment"] | ModelTypes["Product"] | ModelTypes["ProductOption"] | ModelTypes["ProductVariant"] | ModelTypes["Shop"] | ModelTypes["ShopPolicy"] | ModelTypes["UrlRedirect"] | ModelTypes["Video"];
	/** Represents a resource that can be published to the Online Store sales channel. */
["OnlineStorePublishable"]: ModelTypes["Article"] | ModelTypes["Blog"] | ModelTypes["Collection"] | ModelTypes["Page"] | ModelTypes["Product"];
	/** An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process, during which time they provides an email address, billing address and payment information. */
["Order"]: {
		/** The reason for the order's cancellation. Returns `null` if the order wasn't canceled. */
	cancelReason?: ModelTypes["OrderCancelReason"] | undefined,
	/** The date and time when the order was canceled. Returns null if the order wasn't canceled. */
	canceledAt?: ModelTypes["DateTime"] | undefined,
	/** The code of the currency used for the payment. */
	currencyCode: ModelTypes["CurrencyCode"],
	/** The subtotal of line items and their discounts, excluding line items that have been removed. Does not contain order-level discounts, duties, shipping costs, or shipping discounts. Taxes are not included unless the order is a taxes-included order. */
	currentSubtotalPrice: ModelTypes["MoneyV2"],
	/** The total cost of duties for the order, including refunds. */
	currentTotalDuties?: ModelTypes["MoneyV2"] | undefined,
	/** The total amount of the order, including duties, taxes and discounts, minus amounts for line items that have been removed. */
	currentTotalPrice: ModelTypes["MoneyV2"],
	/** The total of all taxes applied to the order, excluding taxes for returned line items. */
	currentTotalTax: ModelTypes["MoneyV2"],
	/** A list of the custom attributes added to the order. */
	customAttributes: Array<ModelTypes["Attribute"]>,
	/** The locale code in which this specific order happened. */
	customerLocale?: string | undefined,
	/** The unique URL that the customer can use to access the order. */
	customerUrl?: ModelTypes["URL"] | undefined,
	/** Discounts that have been applied on the order. */
	discountApplications: ModelTypes["DiscountApplicationConnection"],
	/** Whether the order has had any edits applied or not. */
	edited: boolean,
	/** The customer's email address. */
	email?: string | undefined,
	/** The financial status of the order. */
	financialStatus?: ModelTypes["OrderFinancialStatus"] | undefined,
	/** The fulfillment status for the order. */
	fulfillmentStatus: ModelTypes["OrderFulfillmentStatus"],
	/** A globally-unique ID. */
	id: string,
	/** List of the order’s line items. */
	lineItems: ModelTypes["OrderLineItemConnection"],
	/** Returns a metafield found by namespace and key. */
	metafield?: ModelTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<ModelTypes["Metafield"] | undefined>,
	/** Unique identifier for the order that appears on the order.
For example, _#1000_ or _Store1001.
 */
	name: string,
	/** A unique numeric identifier for the order for use by shop owner and customer. */
	orderNumber: number,
	/** The total cost of duties charged at checkout. */
	originalTotalDuties?: ModelTypes["MoneyV2"] | undefined,
	/** The total price of the order before any applied edits. */
	originalTotalPrice: ModelTypes["MoneyV2"],
	/** The customer's phone number for receiving SMS notifications. */
	phone?: string | undefined,
	/** The date and time when the order was imported.
This value can be set to dates in the past when importing from other systems.
If no value is provided, it will be auto-generated based on current date and time.
 */
	processedAt: ModelTypes["DateTime"],
	/** The address to where the order will be shipped. */
	shippingAddress?: ModelTypes["MailingAddress"] | undefined,
	/** The discounts that have been allocated onto the shipping line by discount applications.
 */
	shippingDiscountAllocations: Array<ModelTypes["DiscountAllocation"]>,
	/** The unique URL for the order's status page. */
	statusUrl: ModelTypes["URL"],
	/** Price of the order before shipping and taxes. */
	subtotalPrice?: ModelTypes["MoneyV2"] | undefined,
	/** Price of the order before duties, shipping and taxes. */
	subtotalPriceV2?: ModelTypes["MoneyV2"] | undefined,
	/** List of the order’s successful fulfillments. */
	successfulFulfillments?: Array<ModelTypes["Fulfillment"]> | undefined,
	/** The sum of all the prices of all the items in the order, duties, taxes and discounts included (must be positive). */
	totalPrice: ModelTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the order, duties, taxes and discounts included (must be positive). */
	totalPriceV2: ModelTypes["MoneyV2"],
	/** The total amount that has been refunded. */
	totalRefunded: ModelTypes["MoneyV2"],
	/** The total amount that has been refunded. */
	totalRefundedV2: ModelTypes["MoneyV2"],
	/** The total cost of shipping. */
	totalShippingPrice: ModelTypes["MoneyV2"],
	/** The total cost of shipping. */
	totalShippingPriceV2: ModelTypes["MoneyV2"],
	/** The total cost of taxes. */
	totalTax?: ModelTypes["MoneyV2"] | undefined,
	/** The total cost of taxes. */
	totalTaxV2?: ModelTypes["MoneyV2"] | undefined
};
	["OrderCancelReason"]:OrderCancelReason;
	/** An auto-generated type for paginating through multiple Orders.
 */
["OrderConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["OrderEdge"]>,
	/** A list of the nodes contained in OrderEdge. */
	nodes: Array<ModelTypes["Order"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"],
	/** The total count of Orders. */
	totalCount: ModelTypes["UnsignedInt64"]
};
	/** An auto-generated type which holds one Order and a cursor during pagination.
 */
["OrderEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of OrderEdge. */
	node: ModelTypes["Order"]
};
	["OrderFinancialStatus"]:OrderFinancialStatus;
	["OrderFulfillmentStatus"]:OrderFulfillmentStatus;
	/** Represents a single line in an order. There is one line item for each distinct product variant. */
["OrderLineItem"]: {
		/** The number of entries associated to the line item minus the items that have been removed. */
	currentQuantity: number,
	/** List of custom attributes associated to the line item. */
	customAttributes: Array<ModelTypes["Attribute"]>,
	/** The discounts that have been allocated onto the order line item by discount applications. */
	discountAllocations: Array<ModelTypes["DiscountAllocation"]>,
	/** The total price of the line item, including discounts, and displayed in the presentment currency. */
	discountedTotalPrice: ModelTypes["MoneyV2"],
	/** The total price of the line item, not including any discounts. The total price is calculated using the original unit price multiplied by the quantity, and it is displayed in the presentment currency. */
	originalTotalPrice: ModelTypes["MoneyV2"],
	/** The number of products variants associated to the line item. */
	quantity: number,
	/** The title of the product combined with title of the variant. */
	title: string,
	/** The product variant object associated to the line item. */
	variant?: ModelTypes["ProductVariant"] | undefined
};
	/** An auto-generated type for paginating through multiple OrderLineItems.
 */
["OrderLineItemConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["OrderLineItemEdge"]>,
	/** A list of the nodes contained in OrderLineItemEdge. */
	nodes: Array<ModelTypes["OrderLineItem"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one OrderLineItem and a cursor during pagination.
 */
["OrderLineItemEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of OrderLineItemEdge. */
	node: ModelTypes["OrderLineItem"]
};
	["OrderSortKeys"]:OrderSortKeys;
	/** Shopify merchants can create pages to hold static HTML content. Each Page object represents a custom page on the online store. */
["Page"]: {
		/** The description of the page, complete with HTML formatting. */
	body: ModelTypes["HTML"],
	/** Summary of the page body. */
	bodySummary: string,
	/** The timestamp of the page creation. */
	createdAt: ModelTypes["DateTime"],
	/** A human-friendly unique string for the page automatically generated from its title. */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** Returns a metafield found by namespace and key. */
	metafield?: ModelTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<ModelTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: ModelTypes["URL"] | undefined,
	/** The page's SEO information. */
	seo?: ModelTypes["SEO"] | undefined,
	/** The title of the page. */
	title: string,
	/** The timestamp of the latest page update. */
	updatedAt: ModelTypes["DateTime"]
};
	/** An auto-generated type for paginating through multiple Pages.
 */
["PageConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["PageEdge"]>,
	/** A list of the nodes contained in PageEdge. */
	nodes: Array<ModelTypes["Page"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one Page and a cursor during pagination.
 */
["PageEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of PageEdge. */
	node: ModelTypes["Page"]
};
	/** Returns information about pagination in a connection, in accordance with the
[Relay specification](https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo).
For more information, please read our [GraphQL Pagination Usage Guide](https://shopify.dev/api/usage/pagination-graphql).
 */
["PageInfo"]: {
		/** The cursor corresponding to the last node in edges. */
	endCursor?: string | undefined,
	/** Whether there are more pages to fetch following the current page. */
	hasNextPage: boolean,
	/** Whether there are any pages prior to the current page. */
	hasPreviousPage: boolean,
	/** The cursor corresponding to the first node in edges. */
	startCursor?: string | undefined
};
	["PageSortKeys"]:PageSortKeys;
	/** A payment applied to a checkout. */
["Payment"]: {
		/** The amount of the payment. */
	amount: ModelTypes["MoneyV2"],
	/** The amount of the payment. */
	amountV2: ModelTypes["MoneyV2"],
	/** The billing address for the payment. */
	billingAddress?: ModelTypes["MailingAddress"] | undefined,
	/** The checkout to which the payment belongs. */
	checkout: ModelTypes["Checkout"],
	/** The credit card used for the payment in the case of direct payments. */
	creditCard?: ModelTypes["CreditCard"] | undefined,
	/** A message describing a processing error during asynchronous processing. */
	errorMessage?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** A client-side generated token to identify a payment and perform idempotent operations.
For more information, refer to
[Idempotent requests](https://shopify.dev/api/usage/idempotent-requests).
 */
	idempotencyKey?: string | undefined,
	/** The URL where the customer needs to be redirected so they can complete the 3D Secure payment flow. */
	nextActionUrl?: ModelTypes["URL"] | undefined,
	/** Whether the payment is still processing asynchronously. */
	ready: boolean,
	/** A flag to indicate if the payment is to be done in test mode for gateways that support it. */
	test: boolean,
	/** The actual transaction recorded by Shopify after having processed the payment with the gateway. */
	transaction?: ModelTypes["Transaction"] | undefined
};
	/** Settings related to payments. */
["PaymentSettings"]: {
		/** List of the card brands which the shop accepts. */
	acceptedCardBrands: Array<ModelTypes["CardBrand"]>,
	/** The url pointing to the endpoint to vault credit cards. */
	cardVaultUrl: ModelTypes["URL"],
	/** The country where the shop is located. */
	countryCode: ModelTypes["CountryCode"],
	/** The three-letter code for the shop's primary currency. */
	currencyCode: ModelTypes["CurrencyCode"],
	/** A list of enabled currencies (ISO 4217 format) that the shop accepts. Merchants can enable currencies from their Shopify Payments settings in the Shopify admin. */
	enabledPresentmentCurrencies: Array<ModelTypes["CurrencyCode"]>,
	/** The shop’s Shopify Payments account ID. */
	shopifyPaymentsAccountId?: string | undefined,
	/** List of the digital wallets which the shop supports. */
	supportedDigitalWallets: Array<ModelTypes["DigitalWallet"]>
};
	["PaymentTokenType"]:PaymentTokenType;
	/** The input fields for a filter used to view a subset of products in a collection matching a specific price range.
 */
["PriceRangeFilter"]: {
	/** The minimum price in the range. Defaults to zero. */
	min?: number | undefined,
	/** The maximum price in the range. Empty indicates no max price. */
	max?: number | undefined
};
	/** The value of the percentage pricing object. */
["PricingPercentageValue"]: {
		/** The percentage value of the object. */
	percentage: number
};
	/** The price value (fixed or percentage) for a discount application. */
["PricingValue"]:ModelTypes["MoneyV2"] | ModelTypes["PricingPercentageValue"];
	/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
For example, a digital download (such as a movie, music or ebook file) also qualifies as a product, as do services (such as equipment rental, work for hire, customization of another product or an extended warranty). */
["Product"]: {
		/** Indicates if at least one product variant is available for sale. */
	availableForSale: boolean,
	/** List of collections a product belongs to. */
	collections: ModelTypes["CollectionConnection"],
	/** The compare at price of the product across all variants. */
	compareAtPriceRange: ModelTypes["ProductPriceRange"],
	/** The date and time when the product was created. */
	createdAt: ModelTypes["DateTime"],
	/** Stripped description of the product, single line with HTML tags removed. */
	description: string,
	/** The description of the product, complete with HTML formatting. */
	descriptionHtml: ModelTypes["HTML"],
	/** The featured image for the product.

This field is functionally equivalent to `images(first: 1)`.
 */
	featuredImage?: ModelTypes["Image"] | undefined,
	/** A human-friendly unique string for the Product automatically generated from its title.
They are used by the Liquid templating language to refer to objects.
 */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** List of images associated with the product. */
	images: ModelTypes["ImageConnection"],
	/** Whether the product is a gift card. */
	isGiftCard: boolean,
	/** The media associated with the product. */
	media: ModelTypes["MediaConnection"],
	/** Returns a metafield found by namespace and key. */
	metafield?: ModelTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<ModelTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: ModelTypes["URL"] | undefined,
	/** List of product options. */
	options: Array<ModelTypes["ProductOption"]>,
	/** The price range. */
	priceRange: ModelTypes["ProductPriceRange"],
	/** A categorization that a product can be tagged with, commonly used for filtering and searching. */
	productType: string,
	/** The date and time when the product was published to the channel. */
	publishedAt: ModelTypes["DateTime"],
	/** Whether the product can only be purchased with a selling plan. */
	requiresSellingPlan: boolean,
	/** A list of a product's available selling plan groups. A selling plan group represents a selling method. For example, 'Subscribe and save' is a selling method where customers pay for goods or services per delivery. A selling plan group contains individual selling plans. */
	sellingPlanGroups: ModelTypes["SellingPlanGroupConnection"],
	/** The product's SEO information. */
	seo: ModelTypes["SEO"],
	/** A comma separated list of tags that have been added to the product.
Additional access scope required for private apps: unauthenticated_read_product_tags.
 */
	tags: Array<string>,
	/** The product’s title. */
	title: string,
	/** The total quantity of inventory in stock for this Product. */
	totalInventory?: number | undefined,
	/** The date and time when the product was last modified.
A product's `updatedAt` value can change for different reasons. For example, if an order
is placed for a product that has inventory tracking set up, then the inventory adjustment
is counted as an update.
 */
	updatedAt: ModelTypes["DateTime"],
	/** Find a product’s variant based on its selected options.
This is useful for converting a user’s selection of product options into a single matching variant.
If there is not a variant for the selected options, `null` will be returned.
 */
	variantBySelectedOptions?: ModelTypes["ProductVariant"] | undefined,
	/** List of the product’s variants. */
	variants: ModelTypes["ProductVariantConnection"],
	/** The product’s vendor name. */
	vendor: string
};
	["ProductCollectionSortKeys"]:ProductCollectionSortKeys;
	/** An auto-generated type for paginating through multiple Products.
 */
["ProductConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["ProductEdge"]>,
	/** A list of available filters. */
	filters: Array<ModelTypes["Filter"]>,
	/** A list of the nodes contained in ProductEdge. */
	nodes: Array<ModelTypes["Product"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one Product and a cursor during pagination.
 */
["ProductEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of ProductEdge. */
	node: ModelTypes["Product"]
};
	/** The input fields for a filter used to view a subset of products in a collection. */
["ProductFilter"]: {
	/** Filter on if the product is available for sale. */
	available?: boolean | undefined,
	/** A variant option to filter on. */
	variantOption?: ModelTypes["VariantOptionFilter"] | undefined,
	/** The product type to filter on. */
	productType?: string | undefined,
	/** The product vendor to filter on. */
	productVendor?: string | undefined,
	/** A range of prices to filter with-in. */
	price?: ModelTypes["PriceRangeFilter"] | undefined,
	/** A product metafield to filter on. */
	productMetafield?: ModelTypes["MetafieldFilter"] | undefined,
	/** A variant metafield to filter on. */
	variantMetafield?: ModelTypes["MetafieldFilter"] | undefined,
	/** A product tag to filter on. */
	tag?: string | undefined
};
	["ProductImageSortKeys"]:ProductImageSortKeys;
	["ProductMediaSortKeys"]:ProductMediaSortKeys;
	/** Product property names like "Size", "Color", and "Material" that the customers can select.
Variants are selected based on permutations of these options.
255 characters limit each.
 */
["ProductOption"]: {
		/** A globally-unique ID. */
	id: string,
	/** The product option’s name. */
	name: string,
	/** The corresponding value to the product option name. */
	values: Array<string>
};
	/** The price range of the product. */
["ProductPriceRange"]: {
		/** The highest variant's price. */
	maxVariantPrice: ModelTypes["MoneyV2"],
	/** The lowest variant's price. */
	minVariantPrice: ModelTypes["MoneyV2"]
};
	["ProductSortKeys"]:ProductSortKeys;
	/** A product variant represents a different version of a product, such as differing sizes or differing colors. */
["ProductVariant"]: {
		/** Indicates if the product variant is available for sale. */
	availableForSale: boolean,
	/** The barcode (for example, ISBN, UPC, or GTIN) associated with the variant. */
	barcode?: string | undefined,
	/** The compare at price of the variant. This can be used to mark a variant as on sale, when `compareAtPrice` is higher than `price`. */
	compareAtPrice?: ModelTypes["MoneyV2"] | undefined,
	/** The compare at price of the variant. This can be used to mark a variant as on sale, when `compareAtPriceV2` is higher than `priceV2`. */
	compareAtPriceV2?: ModelTypes["MoneyV2"] | undefined,
	/** Whether a product is out of stock but still available for purchase (used for backorders). */
	currentlyNotInStock: boolean,
	/** A globally-unique ID. */
	id: string,
	/** Image associated with the product variant. This field falls back to the product image if no image is available.
 */
	image?: ModelTypes["Image"] | undefined,
	/** Returns a metafield found by namespace and key. */
	metafield?: ModelTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<ModelTypes["Metafield"] | undefined>,
	/** The product variant’s price. */
	price: ModelTypes["MoneyV2"],
	/** The product variant’s price. */
	priceV2: ModelTypes["MoneyV2"],
	/** The product object that the product variant belongs to. */
	product: ModelTypes["Product"],
	/** The total sellable quantity of the variant for online sales channels. */
	quantityAvailable?: number | undefined,
	/** Whether a customer needs to provide a shipping address when placing an order for the product variant. */
	requiresShipping: boolean,
	/** List of product options applied to the variant. */
	selectedOptions: Array<ModelTypes["SelectedOption"]>,
	/** Represents an association between a variant and a selling plan. Selling plan allocations describe which selling plans are available for each variant, and what their impact is on pricing. */
	sellingPlanAllocations: ModelTypes["SellingPlanAllocationConnection"],
	/** The SKU (stock keeping unit) associated with the variant. */
	sku?: string | undefined,
	/** The in-store pickup availability of this variant by location. */
	storeAvailability: ModelTypes["StoreAvailabilityConnection"],
	/** The product variant’s title. */
	title: string,
	/** The unit price value for the variant based on the variant's measurement. */
	unitPrice?: ModelTypes["MoneyV2"] | undefined,
	/** The unit price measurement for the variant. */
	unitPriceMeasurement?: ModelTypes["UnitPriceMeasurement"] | undefined,
	/** The weight of the product variant in the unit system specified with `weight_unit`. */
	weight?: number | undefined,
	/** Unit of measurement for weight. */
	weightUnit: ModelTypes["WeightUnit"]
};
	/** An auto-generated type for paginating through multiple ProductVariants.
 */
["ProductVariantConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["ProductVariantEdge"]>,
	/** A list of the nodes contained in ProductVariantEdge. */
	nodes: Array<ModelTypes["ProductVariant"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one ProductVariant and a cursor during pagination.
 */
["ProductVariantEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of ProductVariantEdge. */
	node: ModelTypes["ProductVariant"]
};
	["ProductVariantSortKeys"]:ProductVariantSortKeys;
	/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
["QueryRoot"]: {
		/** List of the shop's articles. */
	articles: ModelTypes["ArticleConnection"],
	/** Fetch a specific `Blog` by one of its unique attributes. */
	blog?: ModelTypes["Blog"] | undefined,
	/** Find a blog by its handle. */
	blogByHandle?: ModelTypes["Blog"] | undefined,
	/** List of the shop's blogs. */
	blogs: ModelTypes["BlogConnection"],
	/** Retrieve a cart by its ID. For more information, refer to
[Manage a cart with the Storefront API](https://shopify.dev/custom-storefronts/cart/manage).
 */
	cart?: ModelTypes["Cart"] | undefined,
	/** Fetch a specific `Collection` by one of its unique attributes. */
	collection?: ModelTypes["Collection"] | undefined,
	/** Find a collection by its handle. */
	collectionByHandle?: ModelTypes["Collection"] | undefined,
	/** List of the shop’s collections. */
	collections: ModelTypes["CollectionConnection"],
	/** The customer associated with the given access token. Tokens are obtained by using the
[`customerAccessTokenCreate` mutation](https://shopify.dev/docs/api/storefront/latest/mutations/customerAccessTokenCreate).
 */
	customer?: ModelTypes["Customer"] | undefined,
	/** Returns the localized experiences configured for the shop. */
	localization: ModelTypes["Localization"],
	/** List of the shop's locations that support in-store pickup.

When sorting by distance, you must specify a location via the `near` argument.
 */
	locations: ModelTypes["LocationConnection"],
	/** Retrieve a [navigation menu](https://help.shopify.com/manual/online-store/menus-and-links) by its handle.
 */
	menu?: ModelTypes["Menu"] | undefined,
	/** Fetch a specific Metaobject by one of its unique identifiers. */
	metaobject?: ModelTypes["Metaobject"] | undefined,
	/** All active metaobjects for the shop. */
	metaobjects: ModelTypes["MetaobjectConnection"],
	/** Returns a specific node by ID. */
	node?: ModelTypes["Node"] | undefined,
	/** Returns the list of nodes with the given IDs. */
	nodes: Array<ModelTypes["Node"] | undefined>,
	/** Fetch a specific `Page` by one of its unique attributes. */
	page?: ModelTypes["Page"] | undefined,
	/** Find a page by its handle. */
	pageByHandle?: ModelTypes["Page"] | undefined,
	/** List of the shop's pages. */
	pages: ModelTypes["PageConnection"],
	/** Fetch a specific `Product` by one of its unique attributes. */
	product?: ModelTypes["Product"] | undefined,
	/** Find a product by its handle. */
	productByHandle?: ModelTypes["Product"] | undefined,
	/** Find recommended products related to a given `product_id`.
To learn more about how recommendations are generated, see
[*Showing product recommendations on product pages*](https://help.shopify.com/themes/development/recommended-products).
 */
	productRecommendations?: Array<ModelTypes["Product"]> | undefined,
	/** Tags added to products.
Additional access scope required: unauthenticated_read_product_tags.
 */
	productTags: ModelTypes["StringConnection"],
	/** List of product types for the shop's products that are published to your app. */
	productTypes: ModelTypes["StringConnection"],
	/** List of the shop’s products. */
	products: ModelTypes["ProductConnection"],
	/** The list of public Storefront API versions, including supported, release candidate and unstable versions. */
	publicApiVersions: Array<ModelTypes["ApiVersion"]>,
	/** The shop associated with the storefront access token. */
	shop: ModelTypes["Shop"],
	/** A list of redirects for a shop. */
	urlRedirects: ModelTypes["UrlRedirectConnection"]
};
	/** SEO information. */
["SEO"]: {
		/** The meta description. */
	description?: string | undefined,
	/** The SEO title. */
	title?: string | undefined
};
	/** Script discount applications capture the intentions of a discount that
was created by a Shopify Script.
 */
["ScriptDiscountApplication"]: {
		/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod: ModelTypes["DiscountApplicationAllocationMethod"],
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection: ModelTypes["DiscountApplicationTargetSelection"],
	/** The type of line that the discount is applicable towards. */
	targetType: ModelTypes["DiscountApplicationTargetType"],
	/** The title of the application as defined by the Script. */
	title: string,
	/** The value of the discount application. */
	value: ModelTypes["PricingValue"]
};
	/** Properties used by customers to select a product variant.
Products can have multiple options, like different sizes or colors.
 */
["SelectedOption"]: {
		/** The product option’s name. */
	name: string,
	/** The product option’s value. */
	value: string
};
	/** The input fields required for a selected option. */
["SelectedOptionInput"]: {
	/** The product option’s name. */
	name: string,
	/** The product option’s value. */
	value: string
};
	/** Represents how products and variants can be sold and purchased. */
["SellingPlan"]: {
		/** The initial payment due for the purchase. */
	checkoutCharge: ModelTypes["SellingPlanCheckoutCharge"],
	/** The description of the selling plan. */
	description?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'. */
	name: string,
	/** The selling plan options available in the drop-down list in the storefront. For example, 'Delivery every week' or 'Delivery every 2 weeks' specifies the delivery frequency options for the product. Individual selling plans contribute their options to the associated selling plan group. For example, a selling plan group might have an option called `option1: Delivery every`. One selling plan in that group could contribute `option1: 2 weeks` with the pricing for that option, and another selling plan could contribute `option1: 4 weeks`, with different pricing. */
	options: Array<ModelTypes["SellingPlanOption"]>,
	/** The price adjustments that a selling plan makes when a variant is purchased with a selling plan. */
	priceAdjustments: Array<ModelTypes["SellingPlanPriceAdjustment"]>,
	/** Whether purchasing the selling plan will result in multiple deliveries. */
	recurringDeliveries: boolean
};
	/** Represents an association between a variant and a selling plan. Selling plan allocations describe the options offered for each variant, and the price of the variant when purchased with a selling plan. */
["SellingPlanAllocation"]: {
		/** The checkout charge amount due for the purchase. */
	checkoutChargeAmount: ModelTypes["MoneyV2"],
	/** A list of price adjustments, with a maximum of two. When there are two, the first price adjustment goes into effect at the time of purchase, while the second one starts after a certain number of orders. A price adjustment represents how a selling plan affects pricing when a variant is purchased with a selling plan. Prices display in the customer's currency if the shop is configured for it. */
	priceAdjustments: Array<ModelTypes["SellingPlanAllocationPriceAdjustment"]>,
	/** The remaining balance charge amount due for the purchase. */
	remainingBalanceChargeAmount: ModelTypes["MoneyV2"],
	/** A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'. */
	sellingPlan: ModelTypes["SellingPlan"]
};
	/** An auto-generated type for paginating through multiple SellingPlanAllocations.
 */
["SellingPlanAllocationConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["SellingPlanAllocationEdge"]>,
	/** A list of the nodes contained in SellingPlanAllocationEdge. */
	nodes: Array<ModelTypes["SellingPlanAllocation"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one SellingPlanAllocation and a cursor during pagination.
 */
["SellingPlanAllocationEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of SellingPlanAllocationEdge. */
	node: ModelTypes["SellingPlanAllocation"]
};
	/** The resulting prices for variants when they're purchased with a specific selling plan. */
["SellingPlanAllocationPriceAdjustment"]: {
		/** The price of the variant when it's purchased without a selling plan for the same number of deliveries. For example, if a customer purchases 6 deliveries of $10.00 granola separately, then the price is 6 x $10.00 = $60.00. */
	compareAtPrice: ModelTypes["MoneyV2"],
	/** The effective price for a single delivery. For example, for a prepaid subscription plan that includes 6 deliveries at the price of $48.00, the per delivery price is $8.00. */
	perDeliveryPrice: ModelTypes["MoneyV2"],
	/** The price of the variant when it's purchased with a selling plan For example, for a prepaid subscription plan that includes 6 deliveries of $10.00 granola, where the customer gets 20% off, the price is 6 x $10.00 x 0.80 = $48.00. */
	price: ModelTypes["MoneyV2"],
	/** The resulting price per unit for the variant associated with the selling plan. If the variant isn't sold by quantity or measurement, then this field returns `null`. */
	unitPrice?: ModelTypes["MoneyV2"] | undefined
};
	/** The initial payment due for the purchase. */
["SellingPlanCheckoutCharge"]: {
		/** The charge type for the checkout charge. */
	type: ModelTypes["SellingPlanCheckoutChargeType"],
	/** The charge value for the checkout charge. */
	value: ModelTypes["SellingPlanCheckoutChargeValue"]
};
	/** The percentage value of the price used for checkout charge. */
["SellingPlanCheckoutChargePercentageValue"]: {
		/** The percentage value of the price used for checkout charge. */
	percentage: number
};
	["SellingPlanCheckoutChargeType"]:SellingPlanCheckoutChargeType;
	/** The portion of the price to be charged at checkout. */
["SellingPlanCheckoutChargeValue"]:ModelTypes["MoneyV2"] | ModelTypes["SellingPlanCheckoutChargePercentageValue"];
	/** An auto-generated type for paginating through multiple SellingPlans.
 */
["SellingPlanConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["SellingPlanEdge"]>,
	/** A list of the nodes contained in SellingPlanEdge. */
	nodes: Array<ModelTypes["SellingPlan"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one SellingPlan and a cursor during pagination.
 */
["SellingPlanEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of SellingPlanEdge. */
	node: ModelTypes["SellingPlan"]
};
	/** A fixed amount that's deducted from the original variant price. For example, $10.00 off. */
["SellingPlanFixedAmountPriceAdjustment"]: {
		/** The money value of the price adjustment. */
	adjustmentAmount: ModelTypes["MoneyV2"]
};
	/** A fixed price adjustment for a variant that's purchased with a selling plan. */
["SellingPlanFixedPriceAdjustment"]: {
		/** A new price of the variant when it's purchased with the selling plan. */
	price: ModelTypes["MoneyV2"]
};
	/** Represents a selling method. For example, 'Subscribe and save' is a selling method where customers pay for goods or services per delivery. A selling plan group contains individual selling plans. */
["SellingPlanGroup"]: {
		/** A display friendly name for the app that created the selling plan group. */
	appName?: string | undefined,
	/** The name of the selling plan group. */
	name: string,
	/** Represents the selling plan options available in the drop-down list in the storefront. For example, 'Delivery every week' or 'Delivery every 2 weeks' specifies the delivery frequency options for the product. */
	options: Array<ModelTypes["SellingPlanGroupOption"]>,
	/** A list of selling plans in a selling plan group. A selling plan is a representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'. */
	sellingPlans: ModelTypes["SellingPlanConnection"]
};
	/** An auto-generated type for paginating through multiple SellingPlanGroups.
 */
["SellingPlanGroupConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["SellingPlanGroupEdge"]>,
	/** A list of the nodes contained in SellingPlanGroupEdge. */
	nodes: Array<ModelTypes["SellingPlanGroup"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one SellingPlanGroup and a cursor during pagination.
 */
["SellingPlanGroupEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of SellingPlanGroupEdge. */
	node: ModelTypes["SellingPlanGroup"]
};
	/** Represents an option on a selling plan group that's available in the drop-down list in the storefront.

Individual selling plans contribute their options to the associated selling plan group. For example, a selling plan group might have an option called `option1: Delivery every`. One selling plan in that group could contribute `option1: 2 weeks` with the pricing for that option, and another selling plan could contribute `option1: 4 weeks`, with different pricing. */
["SellingPlanGroupOption"]: {
		/** The name of the option. For example, 'Delivery every'. */
	name: string,
	/** The values for the options specified by the selling plans in the selling plan group. For example, '1 week', '2 weeks', '3 weeks'. */
	values: Array<string>
};
	/** An option provided by a Selling Plan. */
["SellingPlanOption"]: {
		/** The name of the option (ie "Delivery every"). */
	name?: string | undefined,
	/** The value of the option (ie "Month"). */
	value?: string | undefined
};
	/** A percentage amount that's deducted from the original variant price. For example, 10% off. */
["SellingPlanPercentagePriceAdjustment"]: {
		/** The percentage value of the price adjustment. */
	adjustmentPercentage: number
};
	/** Represents by how much the price of a variant associated with a selling plan is adjusted. Each variant can have up to two price adjustments. If a variant has multiple price adjustments, then the first price adjustment applies when the variant is initially purchased. The second price adjustment applies after a certain number of orders (specified by the `orderCount` field) are made. If a selling plan doesn't have any price adjustments, then the unadjusted price of the variant is the effective price. */
["SellingPlanPriceAdjustment"]: {
		/** The type of price adjustment. An adjustment value can have one of three types: percentage, amount off, or a new price. */
	adjustmentValue: ModelTypes["SellingPlanPriceAdjustmentValue"],
	/** The number of orders that the price adjustment applies to. If the price adjustment always applies, then this field is `null`. */
	orderCount?: number | undefined
};
	/** Represents by how much the price of a variant associated with a selling plan is adjusted. Each variant can have up to two price adjustments. */
["SellingPlanPriceAdjustmentValue"]:ModelTypes["SellingPlanFixedAmountPriceAdjustment"] | ModelTypes["SellingPlanFixedPriceAdjustment"] | ModelTypes["SellingPlanPercentagePriceAdjustment"];
	/** A shipping rate to be applied to a checkout. */
["ShippingRate"]: {
		/** Human-readable unique identifier for this shipping rate. */
	handle: string,
	/** Price of this shipping rate. */
	price: ModelTypes["MoneyV2"],
	/** Price of this shipping rate. */
	priceV2: ModelTypes["MoneyV2"],
	/** Title of this shipping rate. */
	title: string
};
	/** Shop represents a collection of the general settings and information about the shop. */
["Shop"]: {
		/** The shop's branding configuration. */
	brand?: ModelTypes["Brand"] | undefined,
	/** A description of the shop. */
	description?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** Returns a metafield found by namespace and key. */
	metafield?: ModelTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<ModelTypes["Metafield"] | undefined>,
	/** A string representing the way currency is formatted when the currency isn’t specified. */
	moneyFormat: string,
	/** The shop’s name. */
	name: string,
	/** Settings related to payments. */
	paymentSettings: ModelTypes["PaymentSettings"],
	/** The primary domain of the shop’s Online Store. */
	primaryDomain: ModelTypes["Domain"],
	/** The shop’s privacy policy. */
	privacyPolicy?: ModelTypes["ShopPolicy"] | undefined,
	/** The shop’s refund policy. */
	refundPolicy?: ModelTypes["ShopPolicy"] | undefined,
	/** The shop’s shipping policy. */
	shippingPolicy?: ModelTypes["ShopPolicy"] | undefined,
	/** Countries that the shop ships to. */
	shipsToCountries: Array<ModelTypes["CountryCode"]>,
	/** The shop’s subscription policy. */
	subscriptionPolicy?: ModelTypes["ShopPolicyWithDefault"] | undefined,
	/** The shop’s terms of service. */
	termsOfService?: ModelTypes["ShopPolicy"] | undefined
};
	/** Policy that a merchant has configured for their store, such as their refund or privacy policy. */
["ShopPolicy"]: {
		/** Policy text, maximum size of 64kb. */
	body: string,
	/** Policy’s handle. */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** Policy’s title. */
	title: string,
	/** Public URL to the policy. */
	url: ModelTypes["URL"]
};
	/** A policy for the store that comes with a default value, such as a subscription policy.
If the merchant hasn't configured a policy for their store, then the policy will return the default value.
Otherwise, the policy will return the merchant-configured value.
 */
["ShopPolicyWithDefault"]: {
		/** The text of the policy. Maximum size: 64KB. */
	body: string,
	/** The handle of the policy. */
	handle: string,
	/** The unique ID of the policy. A default policy doesn't have an ID. */
	id?: string | undefined,
	/** The title of the policy. */
	title: string,
	/** Public URL to the policy. */
	url: ModelTypes["URL"]
};
	/** The availability of a product variant at a particular location.
Local pick-up must be enabled in the  store's shipping settings, otherwise this will return an empty result.
 */
["StoreAvailability"]: {
		/** Whether the product variant is in-stock at this location. */
	available: boolean,
	/** The location where this product variant is stocked at. */
	location: ModelTypes["Location"],
	/** Returns the estimated amount of time it takes for pickup to be ready (Example: Usually ready in 24 hours). */
	pickUpTime: string
};
	/** An auto-generated type for paginating through multiple StoreAvailabilities.
 */
["StoreAvailabilityConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["StoreAvailabilityEdge"]>,
	/** A list of the nodes contained in StoreAvailabilityEdge. */
	nodes: Array<ModelTypes["StoreAvailability"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one StoreAvailability and a cursor during pagination.
 */
["StoreAvailabilityEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of StoreAvailabilityEdge. */
	node: ModelTypes["StoreAvailability"]
};
	/** An auto-generated type for paginating through a list of Strings.
 */
["StringConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["StringEdge"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one String and a cursor during pagination.
 */
["StringEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of StringEdge. */
	node: string
};
	/** Specifies the fields required to complete a checkout with
a tokenized payment.
 */
["TokenizedPaymentInputV3"]: {
	/** The amount and currency of the payment. */
	paymentAmount: ModelTypes["MoneyInput"],
	/** A unique client generated key used to avoid duplicate charges. When a duplicate payment is found, the original is returned instead of creating a new one. For more information, refer to [Idempotent requests](https://shopify.dev/api/usage/idempotent-requests). */
	idempotencyKey: string,
	/** The billing address for the payment. */
	billingAddress: ModelTypes["MailingAddressInput"],
	/** A simple string or JSON containing the required payment data for the tokenized payment. */
	paymentData: string,
	/** Whether to execute the payment in test mode, if possible. Test mode is not supported in production stores. Defaults to `false`. */
	test?: boolean | undefined,
	/** Public Hash Key used for AndroidPay payments only. */
	identifier?: string | undefined,
	/** The type of payment token. */
	type: ModelTypes["PaymentTokenType"]
};
	/** An object representing exchange of money for a product or service. */
["Transaction"]: {
		/** The amount of money that the transaction was for. */
	amount: ModelTypes["MoneyV2"],
	/** The amount of money that the transaction was for. */
	amountV2: ModelTypes["MoneyV2"],
	/** The kind of the transaction. */
	kind: ModelTypes["TransactionKind"],
	/** The status of the transaction. */
	status: ModelTypes["TransactionStatus"],
	/** The status of the transaction. */
	statusV2?: ModelTypes["TransactionStatus"] | undefined,
	/** Whether the transaction was done in test mode or not. */
	test: boolean
};
	["TransactionKind"]:TransactionKind;
	["TransactionStatus"]:TransactionStatus;
	/** Represents an [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986) and
[RFC 3987](https://datatracker.ietf.org/doc/html/rfc3987)-compliant URI string.

For example, `"https://johns-apparel.myshopify.com"` is a valid URL. It includes a scheme (`https`) and a host
(`johns-apparel.myshopify.com`).
 */
["URL"]:any;
	/** The measurement used to calculate a unit price for a product variant (e.g. $9.99 / 100ml).
 */
["UnitPriceMeasurement"]: {
		/** The type of unit of measurement for the unit price measurement. */
	measuredType?: ModelTypes["UnitPriceMeasurementMeasuredType"] | undefined,
	/** The quantity unit for the unit price measurement. */
	quantityUnit?: ModelTypes["UnitPriceMeasurementMeasuredUnit"] | undefined,
	/** The quantity value for the unit price measurement. */
	quantityValue: number,
	/** The reference unit for the unit price measurement. */
	referenceUnit?: ModelTypes["UnitPriceMeasurementMeasuredUnit"] | undefined,
	/** The reference value for the unit price measurement. */
	referenceValue: number
};
	["UnitPriceMeasurementMeasuredType"]:UnitPriceMeasurementMeasuredType;
	["UnitPriceMeasurementMeasuredUnit"]:UnitPriceMeasurementMeasuredUnit;
	["UnitSystem"]:UnitSystem;
	/** An unsigned 64-bit integer. Represents whole numeric values between 0 and 2^64 - 1 encoded as a string of base-10 digits.

Example value: `"50"`.
 */
["UnsignedInt64"]:any;
	/** A redirect on the online store. */
["UrlRedirect"]: {
		/** The ID of the URL redirect. */
	id: string,
	/** The old path to be redirected from. When the user visits this path, they'll be redirected to the target location. */
	path: string,
	/** The target location where the user will be redirected to. */
	target: string
};
	/** An auto-generated type for paginating through multiple UrlRedirects.
 */
["UrlRedirectConnection"]: {
		/** A list of edges. */
	edges: Array<ModelTypes["UrlRedirectEdge"]>,
	/** A list of the nodes contained in UrlRedirectEdge. */
	nodes: Array<ModelTypes["UrlRedirect"]>,
	/** Information to aid in pagination. */
	pageInfo: ModelTypes["PageInfo"]
};
	/** An auto-generated type which holds one UrlRedirect and a cursor during pagination.
 */
["UrlRedirectEdge"]: {
		/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of UrlRedirectEdge. */
	node: ModelTypes["UrlRedirect"]
};
	/** Represents an error in the input of a mutation. */
["UserError"]: {
		/** The path to the input field that caused the error. */
	field?: Array<string> | undefined,
	/** The error message. */
	message: string
};
	/** The input fields for a filter used to view a subset of products in a collection matching a specific variant option.
 */
["VariantOptionFilter"]: {
	/** The name of the variant option to filter on. */
	name: string,
	/** The value of the variant option to filter on. */
	value: string
};
	/** Represents a Shopify hosted video. */
["Video"]: {
		/** A word or phrase to share the nature or contents of a media. */
	alt?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The media content type. */
	mediaContentType: ModelTypes["MediaContentType"],
	/** The preview image for the media. */
	previewImage?: ModelTypes["Image"] | undefined,
	/** The sources for a video. */
	sources: Array<ModelTypes["VideoSource"]>
};
	/** Represents a source for a Shopify hosted video. */
["VideoSource"]: {
		/** The format of the video source. */
	format: string,
	/** The height of the video. */
	height: number,
	/** The video MIME type. */
	mimeType: string,
	/** The URL of the video. */
	url: string,
	/** The width of the video. */
	width: number
};
	["WeightUnit"]:WeightUnit
    }

export type GraphQLTypes = {
    /** A version of the API, as defined by [Shopify API versioning](https://shopify.dev/api/usage/versioning).
Versions are commonly referred to by their handle (for example, `2021-10`).
 */
["ApiVersion"]: {
	__typename: "ApiVersion",
	/** The human-readable name of the version. */
	displayName: string,
	/** The unique identifier of an ApiVersion. All supported API versions have a date-based (YYYY-MM) or `unstable` handle. */
	handle: string,
	/** Whether the version is actively supported by Shopify. Supported API versions are guaranteed to be stable. Unsupported API versions include unstable, release candidate, and end-of-life versions that are marked as unsupported. For more information, refer to [Versioning](https://shopify.dev/api/usage/versioning). */
	supported: boolean
};
	/** Details about the gift card used on the checkout. */
["AppliedGiftCard"]: {
	__typename: "AppliedGiftCard",
	/** The amount that was taken from the gift card by applying it. */
	amountUsed: GraphQLTypes["MoneyV2"],
	/** The amount that was taken from the gift card by applying it. */
	amountUsedV2: GraphQLTypes["MoneyV2"],
	/** The amount left on the gift card. */
	balance: GraphQLTypes["MoneyV2"],
	/** The amount left on the gift card. */
	balanceV2: GraphQLTypes["MoneyV2"],
	/** A globally-unique ID. */
	id: string,
	/** The last characters of the gift card. */
	lastCharacters: string,
	/** The amount that was applied to the checkout in its currency. */
	presentmentAmountUsed: GraphQLTypes["MoneyV2"]
};
	/** An article in an online store blog. */
["Article"]: {
	__typename: "Article",
	/** The article's author. */
	author: GraphQLTypes["ArticleAuthor"],
	/** The article's author. */
	authorV2?: GraphQLTypes["ArticleAuthor"] | undefined,
	/** The blog that the article belongs to. */
	blog: GraphQLTypes["Blog"],
	/** List of comments posted on the article. */
	comments: GraphQLTypes["CommentConnection"],
	/** Stripped content of the article, single line with HTML tags removed. */
	content: string,
	/** The content of the article, complete with HTML formatting. */
	contentHtml: GraphQLTypes["HTML"],
	/** Stripped excerpt of the article, single line with HTML tags removed. */
	excerpt?: string | undefined,
	/** The excerpt of the article, complete with HTML formatting. */
	excerptHtml?: GraphQLTypes["HTML"] | undefined,
	/** A human-friendly unique string for the Article automatically generated from its title.
 */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** The image associated with the article. */
	image?: GraphQLTypes["Image"] | undefined,
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: GraphQLTypes["URL"] | undefined,
	/** The date and time when the article was published. */
	publishedAt: GraphQLTypes["DateTime"],
	/** The article’s SEO information. */
	seo?: GraphQLTypes["SEO"] | undefined,
	/** A categorization that a article can be tagged with. */
	tags: Array<string>,
	/** The article’s name. */
	title: string
};
	/** The author of an article. */
["ArticleAuthor"]: {
	__typename: "ArticleAuthor",
	/** The author's bio. */
	bio?: string | undefined,
	/** The author’s email. */
	email: string,
	/** The author's first name. */
	firstName: string,
	/** The author's last name. */
	lastName: string,
	/** The author's full name. */
	name: string
};
	/** An auto-generated type for paginating through multiple Articles.
 */
["ArticleConnection"]: {
	__typename: "ArticleConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["ArticleEdge"]>,
	/** A list of the nodes contained in ArticleEdge. */
	nodes: Array<GraphQLTypes["Article"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one Article and a cursor during pagination.
 */
["ArticleEdge"]: {
	__typename: "ArticleEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of ArticleEdge. */
	node: GraphQLTypes["Article"]
};
	/** The set of valid sort keys for the Article query. */
["ArticleSortKeys"]: ArticleSortKeys;
	/** Represents a generic custom attribute. */
["Attribute"]: {
	__typename: "Attribute",
	/** Key or name of the attribute. */
	key: string,
	/** Value of the attribute. */
	value?: string | undefined
};
	/** The input fields for an attribute. */
["AttributeInput"]: {
		/** Key or name of the attribute. */
	key: string,
	/** Value of the attribute. */
	value: string
};
	/** Automatic discount applications capture the intentions of a discount that was automatically applied.
 */
["AutomaticDiscountApplication"]: {
	__typename: "AutomaticDiscountApplication",
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod: GraphQLTypes["DiscountApplicationAllocationMethod"],
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection: GraphQLTypes["DiscountApplicationTargetSelection"],
	/** The type of line that the discount is applicable towards. */
	targetType: GraphQLTypes["DiscountApplicationTargetType"],
	/** The title of the application. */
	title: string,
	/** The value of the discount application. */
	value: GraphQLTypes["PricingValue"]
};
	/** A collection of available shipping rates for a checkout. */
["AvailableShippingRates"]: {
	__typename: "AvailableShippingRates",
	/** Whether or not the shipping rates are ready.
The `shippingRates` field is `null` when this value is `false`.
This field should be polled until its value becomes `true`.
 */
	ready: boolean,
	/** The fetched shipping rates. `null` until the `ready` field is `true`. */
	shippingRates?: Array<GraphQLTypes["ShippingRate"]> | undefined
};
	/** An online store blog. */
["Blog"]: {
	__typename: "Blog",
	/** Find an article by its handle. */
	articleByHandle?: GraphQLTypes["Article"] | undefined,
	/** List of the blog's articles. */
	articles: GraphQLTypes["ArticleConnection"],
	/** The authors who have contributed to the blog. */
	authors: Array<GraphQLTypes["ArticleAuthor"]>,
	/** A human-friendly unique string for the Blog automatically generated from its title.
 */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: GraphQLTypes["URL"] | undefined,
	/** The blog's SEO information. */
	seo?: GraphQLTypes["SEO"] | undefined,
	/** The blogs’s title. */
	title: string
};
	/** An auto-generated type for paginating through multiple Blogs.
 */
["BlogConnection"]: {
	__typename: "BlogConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["BlogEdge"]>,
	/** A list of the nodes contained in BlogEdge. */
	nodes: Array<GraphQLTypes["Blog"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one Blog and a cursor during pagination.
 */
["BlogEdge"]: {
	__typename: "BlogEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of BlogEdge. */
	node: GraphQLTypes["Blog"]
};
	/** The set of valid sort keys for the Blog query. */
["BlogSortKeys"]: BlogSortKeys;
	/** The store's [branding configuration](https://help.shopify.com/en/manual/promoting-marketing/managing-brand-assets).
 */
["Brand"]: {
	__typename: "Brand",
	/** The colors of the store's brand. */
	colors: GraphQLTypes["BrandColors"],
	/** The store's cover image. */
	coverImage?: GraphQLTypes["MediaImage"] | undefined,
	/** The store's default logo. */
	logo?: GraphQLTypes["MediaImage"] | undefined,
	/** The store's short description. */
	shortDescription?: string | undefined,
	/** The store's slogan. */
	slogan?: string | undefined,
	/** The store's preferred logo for square UI elements. */
	squareLogo?: GraphQLTypes["MediaImage"] | undefined
};
	/** A group of related colors for the shop's brand.
 */
["BrandColorGroup"]: {
	__typename: "BrandColorGroup",
	/** The background color. */
	background?: GraphQLTypes["Color"] | undefined,
	/** The foreground color. */
	foreground?: GraphQLTypes["Color"] | undefined
};
	/** The colors of the shop's brand.
 */
["BrandColors"]: {
	__typename: "BrandColors",
	/** The shop's primary brand colors. */
	primary: Array<GraphQLTypes["BrandColorGroup"]>,
	/** The shop's secondary brand colors. */
	secondary: Array<GraphQLTypes["BrandColorGroup"]>
};
	/** Card brand, such as Visa or Mastercard, which can be used for payments. */
["CardBrand"]: CardBrand;
	/** A cart represents the merchandise that a buyer intends to purchase,
and the estimated cost associated with the cart. Learn how to
[interact with a cart](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
during a customer's session.
 */
["Cart"]: {
	__typename: "Cart",
	/** An attribute associated with the cart. */
	attribute?: GraphQLTypes["Attribute"] | undefined,
	/** The attributes associated with the cart. Attributes are represented as key-value pairs. */
	attributes: Array<GraphQLTypes["Attribute"]>,
	/** Information about the buyer that is interacting with the cart. */
	buyerIdentity: GraphQLTypes["CartBuyerIdentity"],
	/** The URL of the checkout for the cart. */
	checkoutUrl: GraphQLTypes["URL"],
	/** The estimated costs that the buyer will pay at checkout. The costs are subject to change and changes will be reflected at checkout. The `cost` field uses the `buyerIdentity` field to determine [international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing). */
	cost: GraphQLTypes["CartCost"],
	/** The date and time when the cart was created. */
	createdAt: GraphQLTypes["DateTime"],
	/** The delivery groups available for the cart, based on the buyer identity default
delivery address preference or the default address of the logged-in customer.
 */
	deliveryGroups: GraphQLTypes["CartDeliveryGroupConnection"],
	/** The discounts that have been applied to the entire cart. */
	discountAllocations: Array<GraphQLTypes["CartDiscountAllocation"]>,
	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes: Array<GraphQLTypes["CartDiscountCode"]>,
	/** The estimated costs that the buyer will pay at checkout.
The estimated costs are subject to change and changes will be reflected at checkout.
The `estimatedCost` field uses the `buyerIdentity` field to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
	estimatedCost: GraphQLTypes["CartEstimatedCost"],
	/** A globally-unique ID. */
	id: string,
	/** A list of lines containing information about the items the customer intends to purchase. */
	lines: GraphQLTypes["CartLineConnection"],
	/** A note that is associated with the cart. For example, the note can be a personalized message to the buyer. */
	note?: string | undefined,
	/** The total number of items in the cart. */
	totalQuantity: number,
	/** The date and time when the cart was updated. */
	updatedAt: GraphQLTypes["DateTime"]
};
	/** Return type for `cartAttributesUpdate` mutation. */
["CartAttributesUpdatePayload"]: {
	__typename: "CartAttributesUpdatePayload",
	/** The updated cart. */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CartUserError"]>
};
	/** The discounts automatically applied to the cart line based on prerequisites that have been met. */
["CartAutomaticDiscountAllocation"]: {
	__typename: "CartAutomaticDiscountAllocation",
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount: GraphQLTypes["MoneyV2"],
	/** The title of the allocated discount. */
	title: string
};
	/** Represents information about the buyer that is interacting with the cart. */
["CartBuyerIdentity"]: {
	__typename: "CartBuyerIdentity",
	/** The country where the buyer is located. */
	countryCode?: GraphQLTypes["CountryCode"] | undefined,
	/** The customer account associated with the cart. */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** An ordered set of delivery addresses tied to the buyer that is interacting with the cart.
The rank of the preferences is determined by the order of the addresses in the array. Preferences
can be used to populate relevant fields in the checkout flow.
 */
	deliveryAddressPreferences: Array<GraphQLTypes["DeliveryAddress"]>,
	/** The email address of the buyer that is interacting with the cart. */
	email?: string | undefined,
	/** The phone number of the buyer that is interacting with the cart. */
	phone?: string | undefined
};
	/** Specifies the input fields to update the buyer information associated with a cart.
Buyer identity is used to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
and should match the customer's shipping address.
 */
["CartBuyerIdentityInput"]: {
		/** The email address of the buyer that is interacting with the cart. */
	email?: string | undefined,
	/** The phone number of the buyer that is interacting with the cart. */
	phone?: string | undefined,
	/** The country where the buyer is located. */
	countryCode?: GraphQLTypes["CountryCode"] | undefined,
	/** The access token used to identify the customer associated with the cart. */
	customerAccessToken?: string | undefined,
	/** An ordered set of delivery addresses tied to the buyer that is interacting with the cart.
The rank of the preferences is determined by the order of the addresses in the array. Preferences
can be used to populate relevant fields in the checkout flow.
 */
	deliveryAddressPreferences?: Array<GraphQLTypes["DeliveryAddressInput"]> | undefined
};
	/** Return type for `cartBuyerIdentityUpdate` mutation. */
["CartBuyerIdentityUpdatePayload"]: {
	__typename: "CartBuyerIdentityUpdatePayload",
	/** The updated cart. */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CartUserError"]>
};
	/** The discount that has been applied to the cart line using a discount code. */
["CartCodeDiscountAllocation"]: {
	__typename: "CartCodeDiscountAllocation",
	/** The code used to apply the discount. */
	code: string,
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount: GraphQLTypes["MoneyV2"]
};
	/** The costs that the buyer will pay at checkout.
The cart cost uses [`CartBuyerIdentity`](https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity) to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
["CartCost"]: {
	__typename: "CartCost",
	/** The estimated amount, before taxes and discounts, for the customer to pay at checkout. The checkout charge amount doesn't include any deferred payments that'll be paid at a later date. If the cart has no deferred payments, then the checkout charge amount is equivalent to `subtotalAmount`. */
	checkoutChargeAmount: GraphQLTypes["MoneyV2"],
	/** The amount, before taxes and cart-level discounts, for the customer to pay. */
	subtotalAmount: GraphQLTypes["MoneyV2"],
	/** Whether the subtotal amount is estimated. */
	subtotalAmountEstimated: boolean,
	/** The total amount for the customer to pay. */
	totalAmount: GraphQLTypes["MoneyV2"],
	/** Whether the total amount is estimated. */
	totalAmountEstimated: boolean,
	/** The duty amount for the customer to pay at checkout. */
	totalDutyAmount?: GraphQLTypes["MoneyV2"] | undefined,
	/** Whether the total duty amount is estimated. */
	totalDutyAmountEstimated: boolean,
	/** The tax amount for the customer to pay at checkout. */
	totalTaxAmount?: GraphQLTypes["MoneyV2"] | undefined,
	/** Whether the total tax amount is estimated. */
	totalTaxAmountEstimated: boolean
};
	/** Return type for `cartCreate` mutation. */
["CartCreatePayload"]: {
	__typename: "CartCreatePayload",
	/** The new cart. */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CartUserError"]>
};
	/** The discounts automatically applied to the cart line based on prerequisites that have been met. */
["CartCustomDiscountAllocation"]: {
	__typename: "CartCustomDiscountAllocation",
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount: GraphQLTypes["MoneyV2"],
	/** The title of the allocated discount. */
	title: string
};
	/** Information about the options available for one or more line items to be delivered to a specific address. */
["CartDeliveryGroup"]: {
	__typename: "CartDeliveryGroup",
	/** A list of cart lines for the delivery group. */
	cartLines: GraphQLTypes["CartLineConnection"],
	/** The destination address for the delivery group. */
	deliveryAddress: GraphQLTypes["MailingAddress"],
	/** The delivery options available for the delivery group. */
	deliveryOptions: Array<GraphQLTypes["CartDeliveryOption"]>,
	/** The ID for the delivery group. */
	id: string,
	/** The selected delivery option for the delivery group. */
	selectedDeliveryOption?: GraphQLTypes["CartDeliveryOption"] | undefined
};
	/** An auto-generated type for paginating through multiple CartDeliveryGroups.
 */
["CartDeliveryGroupConnection"]: {
	__typename: "CartDeliveryGroupConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["CartDeliveryGroupEdge"]>,
	/** A list of the nodes contained in CartDeliveryGroupEdge. */
	nodes: Array<GraphQLTypes["CartDeliveryGroup"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one CartDeliveryGroup and a cursor during pagination.
 */
["CartDeliveryGroupEdge"]: {
	__typename: "CartDeliveryGroupEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CartDeliveryGroupEdge. */
	node: GraphQLTypes["CartDeliveryGroup"]
};
	/** Information about a delivery option. */
["CartDeliveryOption"]: {
	__typename: "CartDeliveryOption",
	/** The code of the delivery option. */
	code?: string | undefined,
	/** The method for the delivery option. */
	deliveryMethodType: GraphQLTypes["DeliveryMethodType"],
	/** The description of the delivery option. */
	description?: string | undefined,
	/** The estimated cost for the delivery option. */
	estimatedCost: GraphQLTypes["MoneyV2"],
	/** The unique identifier of the delivery option. */
	handle: string,
	/** The title of the delivery option. */
	title?: string | undefined
};
	/** The discounts that have been applied to the cart line. */
["CartDiscountAllocation"]: {
	__typename:"CartAutomaticDiscountAllocation" | "CartCodeDiscountAllocation" | "CartCustomDiscountAllocation",
	/** The discounted amount that has been applied to the cart line. */
	discountedAmount: GraphQLTypes["MoneyV2"]
	['...on CartAutomaticDiscountAllocation']: '__union' & GraphQLTypes["CartAutomaticDiscountAllocation"];
	['...on CartCodeDiscountAllocation']: '__union' & GraphQLTypes["CartCodeDiscountAllocation"];
	['...on CartCustomDiscountAllocation']: '__union' & GraphQLTypes["CartCustomDiscountAllocation"];
};
	/** The discount codes applied to the cart. */
["CartDiscountCode"]: {
	__typename: "CartDiscountCode",
	/** Whether the discount code is applicable to the cart's current contents. */
	applicable: boolean,
	/** The code for the discount. */
	code: string
};
	/** Return type for `cartDiscountCodesUpdate` mutation. */
["CartDiscountCodesUpdatePayload"]: {
	__typename: "CartDiscountCodesUpdatePayload",
	/** The updated cart. */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CartUserError"]>
};
	/** Possible error codes that can be returned by `CartUserError`. */
["CartErrorCode"]: CartErrorCode;
	/** The estimated costs that the buyer will pay at checkout.
The estimated cost uses
[`CartBuyerIdentity`](https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity)
to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing).
 */
["CartEstimatedCost"]: {
	__typename: "CartEstimatedCost",
	/** The estimated amount, before taxes and discounts, for the customer to pay at checkout. The checkout charge amount doesn't include any deferred payments that'll be paid at a later date. If the cart has no deferred payments, then the checkout charge amount is equivalent to`subtotal_amount`. */
	checkoutChargeAmount: GraphQLTypes["MoneyV2"],
	/** The estimated amount, before taxes and discounts, for the customer to pay. */
	subtotalAmount: GraphQLTypes["MoneyV2"],
	/** The estimated total amount for the customer to pay. */
	totalAmount: GraphQLTypes["MoneyV2"],
	/** The estimated duty amount for the customer to pay at checkout. */
	totalDutyAmount?: GraphQLTypes["MoneyV2"] | undefined,
	/** The estimated tax amount for the customer to pay at checkout. */
	totalTaxAmount?: GraphQLTypes["MoneyV2"] | undefined
};
	/** The input fields to create a cart. */
["CartInput"]: {
		/** An array of key-value pairs that contains additional information about the cart. */
	attributes?: Array<GraphQLTypes["AttributeInput"]> | undefined,
	/** A list of merchandise lines to add to the cart. */
	lines?: Array<GraphQLTypes["CartLineInput"]> | undefined,
	/** The case-insensitive discount codes that the customer added at checkout.
 */
	discountCodes?: Array<string> | undefined,
	/** A note that is associated with the cart. For example, the note can be a personalized message to the buyer. */
	note?: string | undefined,
	/** The customer associated with the cart. Used to determine [international pricing]
(https://shopify.dev/custom-storefronts/internationalization/international-pricing).
Buyer identity should match the customer's shipping address.
 */
	buyerIdentity?: GraphQLTypes["CartBuyerIdentityInput"] | undefined
};
	/** Represents information about the merchandise in the cart. */
["CartLine"]: {
	__typename: "CartLine",
	/** An attribute associated with the cart line. */
	attribute?: GraphQLTypes["Attribute"] | undefined,
	/** The attributes associated with the cart line. Attributes are represented as key-value pairs. */
	attributes: Array<GraphQLTypes["Attribute"]>,
	/** The cost of the merchandise that the buyer will pay for at checkout. The costs are subject to change and changes will be reflected at checkout. */
	cost: GraphQLTypes["CartLineCost"],
	/** The discounts that have been applied to the cart line. */
	discountAllocations: Array<GraphQLTypes["CartDiscountAllocation"]>,
	/** The estimated cost of the merchandise that the buyer will pay for at checkout. The estimated costs are subject to change and changes will be reflected at checkout. */
	estimatedCost: GraphQLTypes["CartLineEstimatedCost"],
	/** A globally-unique ID. */
	id: string,
	/** The merchandise that the buyer intends to purchase. */
	merchandise: GraphQLTypes["Merchandise"],
	/** The quantity of the merchandise that the customer intends to purchase. */
	quantity: number,
	/** The selling plan associated with the cart line and the effect that each selling plan has on variants when they're purchased. */
	sellingPlanAllocation?: GraphQLTypes["SellingPlanAllocation"] | undefined
};
	/** An auto-generated type for paginating through multiple CartLines.
 */
["CartLineConnection"]: {
	__typename: "CartLineConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["CartLineEdge"]>,
	/** A list of the nodes contained in CartLineEdge. */
	nodes: Array<GraphQLTypes["CartLine"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** The cost of the merchandise line that the buyer will pay at checkout. */
["CartLineCost"]: {
	__typename: "CartLineCost",
	/** The amount of the merchandise line. */
	amountPerQuantity: GraphQLTypes["MoneyV2"],
	/** The compare at amount of the merchandise line. */
	compareAtAmountPerQuantity?: GraphQLTypes["MoneyV2"] | undefined,
	/** The cost of the merchandise line before line-level discounts. */
	subtotalAmount: GraphQLTypes["MoneyV2"],
	/** The total cost of the merchandise line. */
	totalAmount: GraphQLTypes["MoneyV2"]
};
	/** An auto-generated type which holds one CartLine and a cursor during pagination.
 */
["CartLineEdge"]: {
	__typename: "CartLineEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CartLineEdge. */
	node: GraphQLTypes["CartLine"]
};
	/** The estimated cost of the merchandise line that the buyer will pay at checkout. */
["CartLineEstimatedCost"]: {
	__typename: "CartLineEstimatedCost",
	/** The amount of the merchandise line. */
	amount: GraphQLTypes["MoneyV2"],
	/** The compare at amount of the merchandise line. */
	compareAtAmount?: GraphQLTypes["MoneyV2"] | undefined,
	/** The estimated cost of the merchandise line before discounts. */
	subtotalAmount: GraphQLTypes["MoneyV2"],
	/** The estimated total cost of the merchandise line. */
	totalAmount: GraphQLTypes["MoneyV2"]
};
	/** The input fields to create a merchandise line on a cart. */
["CartLineInput"]: {
		/** An array of key-value pairs that contains additional information about the merchandise line. */
	attributes?: Array<GraphQLTypes["AttributeInput"]> | undefined,
	/** The quantity of the merchandise. */
	quantity?: number | undefined,
	/** The ID of the merchandise that the buyer intends to purchase. */
	merchandiseId: string,
	/** The ID of the selling plan that the merchandise is being purchased with. */
	sellingPlanId?: string | undefined
};
	/** The input fields to update a line item on a cart. */
["CartLineUpdateInput"]: {
		/** The ID of the merchandise line. */
	id: string,
	/** The quantity of the line item. */
	quantity?: number | undefined,
	/** The ID of the merchandise for the line item. */
	merchandiseId?: string | undefined,
	/** An array of key-value pairs that contains additional information about the merchandise line. */
	attributes?: Array<GraphQLTypes["AttributeInput"]> | undefined,
	/** The ID of the selling plan that the merchandise is being purchased with. */
	sellingPlanId?: string | undefined
};
	/** Return type for `cartLinesAdd` mutation. */
["CartLinesAddPayload"]: {
	__typename: "CartLinesAddPayload",
	/** The updated cart. */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CartUserError"]>
};
	/** Return type for `cartLinesRemove` mutation. */
["CartLinesRemovePayload"]: {
	__typename: "CartLinesRemovePayload",
	/** The updated cart. */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CartUserError"]>
};
	/** Return type for `cartLinesUpdate` mutation. */
["CartLinesUpdatePayload"]: {
	__typename: "CartLinesUpdatePayload",
	/** The updated cart. */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CartUserError"]>
};
	/** Return type for `cartNoteUpdate` mutation. */
["CartNoteUpdatePayload"]: {
	__typename: "CartNoteUpdatePayload",
	/** The updated cart. */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CartUserError"]>
};
	/** The input fields for updating the selected delivery options for a delivery group.
 */
["CartSelectedDeliveryOptionInput"]: {
		/** The ID of the cart delivery group. */
	deliveryGroupId: string,
	/** The handle of the selected delivery option. */
	deliveryOptionHandle: string
};
	/** Return type for `cartSelectedDeliveryOptionsUpdate` mutation. */
["CartSelectedDeliveryOptionsUpdatePayload"]: {
	__typename: "CartSelectedDeliveryOptionsUpdatePayload",
	/** The updated cart. */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CartUserError"]>
};
	/** Represents an error that happens during execution of a cart mutation. */
["CartUserError"]: {
	__typename: "CartUserError",
	/** The error code. */
	code?: GraphQLTypes["CartErrorCode"] | undefined,
	/** The path to the input field that caused the error. */
	field?: Array<string> | undefined,
	/** The error message. */
	message: string
};
	/** A container for all the information required to checkout items and pay. */
["Checkout"]: {
	__typename: "Checkout",
	/** The gift cards used on the checkout. */
	appliedGiftCards: Array<GraphQLTypes["AppliedGiftCard"]>,
	/** The available shipping rates for this Checkout.
Should only be used when checkout `requiresShipping` is `true` and
the shipping address is valid.
 */
	availableShippingRates?: GraphQLTypes["AvailableShippingRates"] | undefined,
	/** The identity of the customer associated with the checkout. */
	buyerIdentity: GraphQLTypes["CheckoutBuyerIdentity"],
	/** The date and time when the checkout was completed. */
	completedAt?: GraphQLTypes["DateTime"] | undefined,
	/** The date and time when the checkout was created. */
	createdAt: GraphQLTypes["DateTime"],
	/** The currency code for the checkout. */
	currencyCode: GraphQLTypes["CurrencyCode"],
	/** A list of extra information that is added to the checkout. */
	customAttributes: Array<GraphQLTypes["Attribute"]>,
	/** Discounts that have been applied on the checkout. */
	discountApplications: GraphQLTypes["DiscountApplicationConnection"],
	/** The email attached to this checkout. */
	email?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** A list of line item objects, each one containing information about an item in the checkout. */
	lineItems: GraphQLTypes["CheckoutLineItemConnection"],
	/** The sum of all the prices of all the items in the checkout. Duties, taxes, shipping and discounts excluded. */
	lineItemsSubtotalPrice: GraphQLTypes["MoneyV2"],
	/** The note associated with the checkout. */
	note?: string | undefined,
	/** The resulting order from a paid checkout. */
	order?: GraphQLTypes["Order"] | undefined,
	/** The Order Status Page for this Checkout, null when checkout is not completed. */
	orderStatusUrl?: GraphQLTypes["URL"] | undefined,
	/** The amount left to be paid. This is equal to the cost of the line items, taxes, and shipping, minus discounts and gift cards. */
	paymentDue: GraphQLTypes["MoneyV2"],
	/** The amount left to be paid. This is equal to the cost of the line items, duties, taxes, and shipping, minus discounts and gift cards. */
	paymentDueV2: GraphQLTypes["MoneyV2"],
	/** Whether or not the Checkout is ready and can be completed. Checkouts may
have asynchronous operations that can take time to finish. If you want
to complete a checkout or ensure all the fields are populated and up to
date, polling is required until the value is true.
 */
	ready: boolean,
	/** States whether or not the fulfillment requires shipping. */
	requiresShipping: boolean,
	/** The shipping address to where the line items will be shipped. */
	shippingAddress?: GraphQLTypes["MailingAddress"] | undefined,
	/** The discounts that have been allocated onto the shipping line by discount applications.
 */
	shippingDiscountAllocations: Array<GraphQLTypes["DiscountAllocation"]>,
	/** Once a shipping rate is selected by the customer it is transitioned to a `shipping_line` object. */
	shippingLine?: GraphQLTypes["ShippingRate"] | undefined,
	/** The price at checkout before shipping and taxes. */
	subtotalPrice: GraphQLTypes["MoneyV2"],
	/** The price at checkout before duties, shipping, and taxes. */
	subtotalPriceV2: GraphQLTypes["MoneyV2"],
	/** Whether the checkout is tax exempt. */
	taxExempt: boolean,
	/** Whether taxes are included in the line item and shipping line prices. */
	taxesIncluded: boolean,
	/** The sum of all the duties applied to the line items in the checkout. */
	totalDuties?: GraphQLTypes["MoneyV2"] | undefined,
	/** The sum of all the prices of all the items in the checkout, including taxes and duties. */
	totalPrice: GraphQLTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the checkout, including taxes and duties. */
	totalPriceV2: GraphQLTypes["MoneyV2"],
	/** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
	totalTax: GraphQLTypes["MoneyV2"],
	/** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
	totalTaxV2: GraphQLTypes["MoneyV2"],
	/** The date and time when the checkout was last updated. */
	updatedAt: GraphQLTypes["DateTime"],
	/** The url pointing to the checkout accessible from the web. */
	webUrl: GraphQLTypes["URL"]
};
	/** The input fields required to update a checkout's attributes. */
["CheckoutAttributesUpdateV2Input"]: {
		/** The text of an optional note that a shop owner can attach to the checkout. */
	note?: string | undefined,
	/** A list of extra information that is added to the checkout. */
	customAttributes?: Array<GraphQLTypes["AttributeInput"]> | undefined,
	/** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
The required attributes are city, province, and country.
Full validation of the addresses is still done at completion time. Defaults to `false` with 
each operation.
 */
	allowPartialAddresses?: boolean | undefined
};
	/** Return type for `checkoutAttributesUpdateV2` mutation. */
["CheckoutAttributesUpdateV2Payload"]: {
	__typename: "CheckoutAttributesUpdateV2Payload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** The identity of the customer associated with the checkout. */
["CheckoutBuyerIdentity"]: {
	__typename: "CheckoutBuyerIdentity",
	/** The country code for the checkout. For example, `CA`. */
	countryCode?: GraphQLTypes["CountryCode"] | undefined
};
	/** The input fields for the identity of the customer associated with the checkout. */
["CheckoutBuyerIdentityInput"]: {
		/** The country code of one of the shop's
[enabled countries](https://help.shopify.com/en/manual/payments/shopify-payments/multi-currency/setup).
For example, `CA`. Including this field creates a checkout in the specified country's currency.
 */
	countryCode: GraphQLTypes["CountryCode"]
};
	/** Return type for `checkoutCompleteFree` mutation. */
["CheckoutCompleteFreePayload"]: {
	__typename: "CheckoutCompleteFreePayload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutCompleteWithCreditCardV2` mutation. */
["CheckoutCompleteWithCreditCardV2Payload"]: {
	__typename: "CheckoutCompleteWithCreditCardV2Payload",
	/** The checkout on which the payment was applied. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** A representation of the attempted payment. */
	payment?: GraphQLTypes["Payment"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutCompleteWithTokenizedPaymentV3` mutation. */
["CheckoutCompleteWithTokenizedPaymentV3Payload"]: {
	__typename: "CheckoutCompleteWithTokenizedPaymentV3Payload",
	/** The checkout on which the payment was applied. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** A representation of the attempted payment. */
	payment?: GraphQLTypes["Payment"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** The input fields required to create a checkout. */
["CheckoutCreateInput"]: {
		/** The email with which the customer wants to checkout. */
	email?: string | undefined,
	/** A list of line item objects, each one containing information about an item in the checkout. */
	lineItems?: Array<GraphQLTypes["CheckoutLineItemInput"]> | undefined,
	/** The shipping address to where the line items will be shipped. */
	shippingAddress?: GraphQLTypes["MailingAddressInput"] | undefined,
	/** The text of an optional note that a shop owner can attach to the checkout. */
	note?: string | undefined,
	/** A list of extra information that is added to the checkout. */
	customAttributes?: Array<GraphQLTypes["AttributeInput"]> | undefined,
	/** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
The required attributes are city, province, and country.
Full validation of addresses is still done at completion time. Defaults to `null`.
 */
	allowPartialAddresses?: boolean | undefined,
	/** The identity of the customer associated with the checkout. */
	buyerIdentity?: GraphQLTypes["CheckoutBuyerIdentityInput"] | undefined
};
	/** Return type for `checkoutCreate` mutation. */
["CheckoutCreatePayload"]: {
	__typename: "CheckoutCreatePayload",
	/** The new checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The checkout queue token. Available only to selected stores. */
	queueToken?: string | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutCustomerAssociateV2` mutation. */
["CheckoutCustomerAssociateV2Payload"]: {
	__typename: "CheckoutCustomerAssociateV2Payload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The associated customer object. */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutCustomerDisassociateV2` mutation. */
["CheckoutCustomerDisassociateV2Payload"]: {
	__typename: "CheckoutCustomerDisassociateV2Payload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutDiscountCodeApplyV2` mutation. */
["CheckoutDiscountCodeApplyV2Payload"]: {
	__typename: "CheckoutDiscountCodeApplyV2Payload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutDiscountCodeRemove` mutation. */
["CheckoutDiscountCodeRemovePayload"]: {
	__typename: "CheckoutDiscountCodeRemovePayload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutEmailUpdateV2` mutation. */
["CheckoutEmailUpdateV2Payload"]: {
	__typename: "CheckoutEmailUpdateV2Payload",
	/** The checkout object with the updated email. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Possible error codes that can be returned by `CheckoutUserError`. */
["CheckoutErrorCode"]: CheckoutErrorCode;
	/** Return type for `checkoutGiftCardRemoveV2` mutation. */
["CheckoutGiftCardRemoveV2Payload"]: {
	__typename: "CheckoutGiftCardRemoveV2Payload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutGiftCardsAppend` mutation. */
["CheckoutGiftCardsAppendPayload"]: {
	__typename: "CheckoutGiftCardsAppendPayload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** A single line item in the checkout, grouped by variant and attributes. */
["CheckoutLineItem"]: {
	__typename: "CheckoutLineItem",
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes: Array<GraphQLTypes["Attribute"]>,
	/** The discounts that have been allocated onto the checkout line item by discount applications. */
	discountAllocations: Array<GraphQLTypes["DiscountAllocation"]>,
	/** A globally-unique ID. */
	id: string,
	/** The quantity of the line item. */
	quantity: number,
	/** Title of the line item. Defaults to the product's title. */
	title: string,
	/** Unit price of the line item. */
	unitPrice?: GraphQLTypes["MoneyV2"] | undefined,
	/** Product variant of the line item. */
	variant?: GraphQLTypes["ProductVariant"] | undefined
};
	/** An auto-generated type for paginating through multiple CheckoutLineItems.
 */
["CheckoutLineItemConnection"]: {
	__typename: "CheckoutLineItemConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["CheckoutLineItemEdge"]>,
	/** A list of the nodes contained in CheckoutLineItemEdge. */
	nodes: Array<GraphQLTypes["CheckoutLineItem"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one CheckoutLineItem and a cursor during pagination.
 */
["CheckoutLineItemEdge"]: {
	__typename: "CheckoutLineItemEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CheckoutLineItemEdge. */
	node: GraphQLTypes["CheckoutLineItem"]
};
	/** The input fields to create a line item on a checkout. */
["CheckoutLineItemInput"]: {
		/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?: Array<GraphQLTypes["AttributeInput"]> | undefined,
	/** The quantity of the line item. */
	quantity: number,
	/** The ID of the product variant for the line item. */
	variantId: string
};
	/** The input fields to update a line item on the checkout. */
["CheckoutLineItemUpdateInput"]: {
		/** The ID of the line item. */
	id?: string | undefined,
	/** The variant ID of the line item. */
	variantId?: string | undefined,
	/** The quantity of the line item. */
	quantity?: number | undefined,
	/** Extra information in the form of an array of Key-Value pairs about the line item. */
	customAttributes?: Array<GraphQLTypes["AttributeInput"]> | undefined
};
	/** Return type for `checkoutLineItemsAdd` mutation. */
["CheckoutLineItemsAddPayload"]: {
	__typename: "CheckoutLineItemsAddPayload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutLineItemsRemove` mutation. */
["CheckoutLineItemsRemovePayload"]: {
	__typename: "CheckoutLineItemsRemovePayload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutLineItemsReplace` mutation. */
["CheckoutLineItemsReplacePayload"]: {
	__typename: "CheckoutLineItemsReplacePayload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["CheckoutUserError"]>
};
	/** Return type for `checkoutLineItemsUpdate` mutation. */
["CheckoutLineItemsUpdatePayload"]: {
	__typename: "CheckoutLineItemsUpdatePayload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutShippingAddressUpdateV2` mutation. */
["CheckoutShippingAddressUpdateV2Payload"]: {
	__typename: "CheckoutShippingAddressUpdateV2Payload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `checkoutShippingLineUpdate` mutation. */
["CheckoutShippingLineUpdatePayload"]: {
	__typename: "CheckoutShippingLineUpdatePayload",
	/** The updated checkout object. */
	checkout?: GraphQLTypes["Checkout"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	checkoutUserErrors: Array<GraphQLTypes["CheckoutUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Represents an error that happens during execution of a checkout mutation. */
["CheckoutUserError"]: {
	__typename: "CheckoutUserError",
	/** The error code. */
	code?: GraphQLTypes["CheckoutErrorCode"] | undefined,
	/** The path to the input field that caused the error. */
	field?: Array<string> | undefined,
	/** The error message. */
	message: string
};
	/** A collection represents a grouping of products that a shop owner can create to organize them or make their shops easier to browse. */
["Collection"]: {
	__typename: "Collection",
	/** Stripped description of the collection, single line with HTML tags removed. */
	description: string,
	/** The description of the collection, complete with HTML formatting. */
	descriptionHtml: GraphQLTypes["HTML"],
	/** A human-friendly unique string for the collection automatically generated from its title.
Limit of 255 characters.
 */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** Image associated with the collection. */
	image?: GraphQLTypes["Image"] | undefined,
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: GraphQLTypes["URL"] | undefined,
	/** List of products in the collection. */
	products: GraphQLTypes["ProductConnection"],
	/** The collection's SEO information. */
	seo: GraphQLTypes["SEO"],
	/** The collection’s name. Limit of 255 characters. */
	title: string,
	/** The date and time when the collection was last modified. */
	updatedAt: GraphQLTypes["DateTime"]
};
	/** An auto-generated type for paginating through multiple Collections.
 */
["CollectionConnection"]: {
	__typename: "CollectionConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["CollectionEdge"]>,
	/** A list of the nodes contained in CollectionEdge. */
	nodes: Array<GraphQLTypes["Collection"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one Collection and a cursor during pagination.
 */
["CollectionEdge"]: {
	__typename: "CollectionEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CollectionEdge. */
	node: GraphQLTypes["Collection"]
};
	/** The set of valid sort keys for the Collection query. */
["CollectionSortKeys"]: CollectionSortKeys;
	/** A string containing a hexadecimal representation of a color.

For example, "#6A8D48".
 */
["Color"]: "scalar" & { name: "Color" };
	/** A comment on an article. */
["Comment"]: {
	__typename: "Comment",
	/** The comment’s author. */
	author: GraphQLTypes["CommentAuthor"],
	/** Stripped content of the comment, single line with HTML tags removed. */
	content: string,
	/** The content of the comment, complete with HTML formatting. */
	contentHtml: GraphQLTypes["HTML"],
	/** A globally-unique ID. */
	id: string
};
	/** The author of a comment. */
["CommentAuthor"]: {
	__typename: "CommentAuthor",
	/** The author's email. */
	email: string,
	/** The author’s name. */
	name: string
};
	/** An auto-generated type for paginating through multiple Comments.
 */
["CommentConnection"]: {
	__typename: "CommentConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["CommentEdge"]>,
	/** A list of the nodes contained in CommentEdge. */
	nodes: Array<GraphQLTypes["Comment"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one Comment and a cursor during pagination.
 */
["CommentEdge"]: {
	__typename: "CommentEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of CommentEdge. */
	node: GraphQLTypes["Comment"]
};
	/** A country. */
["Country"]: {
	__typename: "Country",
	/** The languages available for the country. */
	availableLanguages: Array<GraphQLTypes["Language"]>,
	/** The currency of the country. */
	currency: GraphQLTypes["Currency"],
	/** The ISO code of the country. */
	isoCode: GraphQLTypes["CountryCode"],
	/** The name of the country. */
	name: string,
	/** The unit system used in the country. */
	unitSystem: GraphQLTypes["UnitSystem"]
};
	/** The code designating a country/region, which generally follows ISO 3166-1 alpha-2 guidelines.
If a territory doesn't have a country code value in the `CountryCode` enum, then it might be considered a subdivision
of another country. For example, the territories associated with Spain are represented by the country code `ES`,
and the territories associated with the United States of America are represented by the country code `US`.
 */
["CountryCode"]: CountryCode;
	/** Credit card information used for a payment. */
["CreditCard"]: {
	__typename: "CreditCard",
	/** The brand of the credit card. */
	brand?: string | undefined,
	/** The expiry month of the credit card. */
	expiryMonth?: number | undefined,
	/** The expiry year of the credit card. */
	expiryYear?: number | undefined,
	/** The credit card's BIN number. */
	firstDigits?: string | undefined,
	/** The first name of the card holder. */
	firstName?: string | undefined,
	/** The last 4 digits of the credit card. */
	lastDigits?: string | undefined,
	/** The last name of the card holder. */
	lastName?: string | undefined,
	/** The masked credit card number with only the last 4 digits displayed. */
	maskedNumber?: string | undefined
};
	/** Specifies the fields required to complete a checkout with
a Shopify vaulted credit card payment.
 */
["CreditCardPaymentInputV2"]: {
		/** The amount and currency of the payment. */
	paymentAmount: GraphQLTypes["MoneyInput"],
	/** A unique client generated key used to avoid duplicate charges. When a duplicate payment is found, the original is returned instead of creating a new one. For more information, refer to [Idempotent requests](https://shopify.dev/api/usage/idempotent-requests). */
	idempotencyKey: string,
	/** The billing address for the payment. */
	billingAddress: GraphQLTypes["MailingAddressInput"],
	/** The ID returned by Shopify's Card Vault. */
	vaultId: string,
	/** Executes the payment in test mode if possible. Defaults to `false`. */
	test?: boolean | undefined
};
	/** The part of the image that should remain after cropping. */
["CropRegion"]: CropRegion;
	/** A currency. */
["Currency"]: {
	__typename: "Currency",
	/** The ISO code of the currency. */
	isoCode: GraphQLTypes["CurrencyCode"],
	/** The name of the currency. */
	name: string,
	/** The symbol of the currency. */
	symbol: string
};
	/** The three-letter currency codes that represent the world currencies used in stores. These include standard ISO 4217 codes, legacy codes,
and non-standard codes.
 */
["CurrencyCode"]: CurrencyCode;
	/** A customer represents a customer account with the shop. Customer accounts store contact information for the customer, saving logged-in customers the trouble of having to provide it at every checkout. */
["Customer"]: {
	__typename: "Customer",
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing: boolean,
	/** A list of addresses for the customer. */
	addresses: GraphQLTypes["MailingAddressConnection"],
	/** The date and time when the customer was created. */
	createdAt: GraphQLTypes["DateTime"],
	/** The customer’s default address. */
	defaultAddress?: GraphQLTypes["MailingAddress"] | undefined,
	/** The customer’s name, email or phone number. */
	displayName: string,
	/** The customer’s email address. */
	email?: string | undefined,
	/** The customer’s first name. */
	firstName?: string | undefined,
	/** A unique ID for the customer. */
	id: string,
	/** The customer's most recently updated, incomplete checkout. */
	lastIncompleteCheckout?: GraphQLTypes["Checkout"] | undefined,
	/** The customer’s last name. */
	lastName?: string | undefined,
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>,
	/** The number of orders that the customer has made at the store in their lifetime. */
	numberOfOrders: GraphQLTypes["UnsignedInt64"],
	/** The orders associated with the customer. */
	orders: GraphQLTypes["OrderConnection"],
	/** The customer’s phone number. */
	phone?: string | undefined,
	/** A comma separated list of tags that have been added to the customer.
Additional access scope required: unauthenticated_read_customer_tags.
 */
	tags: Array<string>,
	/** The date and time when the customer information was updated. */
	updatedAt: GraphQLTypes["DateTime"]
};
	/** A CustomerAccessToken represents the unique token required to make modifications to the customer object. */
["CustomerAccessToken"]: {
	__typename: "CustomerAccessToken",
	/** The customer’s access token. */
	accessToken: string,
	/** The date and time when the customer access token expires. */
	expiresAt: GraphQLTypes["DateTime"]
};
	/** The input fields required to create a customer access token. */
["CustomerAccessTokenCreateInput"]: {
		/** The email associated to the customer. */
	email: string,
	/** The login password to be used by the customer. */
	password: string
};
	/** Return type for `customerAccessTokenCreate` mutation. */
["CustomerAccessTokenCreatePayload"]: {
	__typename: "CustomerAccessTokenCreatePayload",
	/** The newly created customer access token object. */
	customerAccessToken?: GraphQLTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `customerAccessTokenCreateWithMultipass` mutation. */
["CustomerAccessTokenCreateWithMultipassPayload"]: {
	__typename: "CustomerAccessTokenCreateWithMultipassPayload",
	/** An access token object associated with the customer. */
	customerAccessToken?: GraphQLTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>
};
	/** Return type for `customerAccessTokenDelete` mutation. */
["CustomerAccessTokenDeletePayload"]: {
	__typename: "CustomerAccessTokenDeletePayload",
	/** The destroyed access token. */
	deletedAccessToken?: string | undefined,
	/** ID of the destroyed customer access token. */
	deletedCustomerAccessTokenId?: string | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `customerAccessTokenRenew` mutation. */
["CustomerAccessTokenRenewPayload"]: {
	__typename: "CustomerAccessTokenRenewPayload",
	/** The renewed customer access token object. */
	customerAccessToken?: GraphQLTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `customerActivateByUrl` mutation. */
["CustomerActivateByUrlPayload"]: {
	__typename: "CustomerActivateByUrlPayload",
	/** The customer that was activated. */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** A new customer access token for the customer. */
	customerAccessToken?: GraphQLTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>
};
	/** The input fields to activate a customer. */
["CustomerActivateInput"]: {
		/** The activation token required to activate the customer. */
	activationToken: string,
	/** New password that will be set during activation. */
	password: string
};
	/** Return type for `customerActivate` mutation. */
["CustomerActivatePayload"]: {
	__typename: "CustomerActivatePayload",
	/** The customer object. */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** A newly created customer access token object for the customer. */
	customerAccessToken?: GraphQLTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `customerAddressCreate` mutation. */
["CustomerAddressCreatePayload"]: {
	__typename: "CustomerAddressCreatePayload",
	/** The new customer address object. */
	customerAddress?: GraphQLTypes["MailingAddress"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `customerAddressDelete` mutation. */
["CustomerAddressDeletePayload"]: {
	__typename: "CustomerAddressDeletePayload",
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** ID of the deleted customer address. */
	deletedCustomerAddressId?: string | undefined,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `customerAddressUpdate` mutation. */
["CustomerAddressUpdatePayload"]: {
	__typename: "CustomerAddressUpdatePayload",
	/** The customer’s updated mailing address. */
	customerAddress?: GraphQLTypes["MailingAddress"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** The input fields to create a new customer. */
["CustomerCreateInput"]: {
		/** The customer’s first name. */
	firstName?: string | undefined,
	/** The customer’s last name. */
	lastName?: string | undefined,
	/** The customer’s email. */
	email: string,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined,
	/** The login password used by the customer. */
	password: string,
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?: boolean | undefined
};
	/** Return type for `customerCreate` mutation. */
["CustomerCreatePayload"]: {
	__typename: "CustomerCreatePayload",
	/** The created customer object. */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `customerDefaultAddressUpdate` mutation. */
["CustomerDefaultAddressUpdatePayload"]: {
	__typename: "CustomerDefaultAddressUpdatePayload",
	/** The updated customer object. */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Possible error codes that can be returned by `CustomerUserError`. */
["CustomerErrorCode"]: CustomerErrorCode;
	/** Return type for `customerRecover` mutation. */
["CustomerRecoverPayload"]: {
	__typename: "CustomerRecoverPayload",
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Return type for `customerResetByUrl` mutation. */
["CustomerResetByUrlPayload"]: {
	__typename: "CustomerResetByUrlPayload",
	/** The customer object which was reset. */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** A newly created customer access token object for the customer. */
	customerAccessToken?: GraphQLTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** The input fields to reset a customer's password. */
["CustomerResetInput"]: {
		/** The reset token required to reset the customer’s password. */
	resetToken: string,
	/** New password that will be set as part of the reset password process. */
	password: string
};
	/** Return type for `customerReset` mutation. */
["CustomerResetPayload"]: {
	__typename: "CustomerResetPayload",
	/** The customer object which was reset. */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** A newly created customer access token object for the customer. */
	customerAccessToken?: GraphQLTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** The input fields to update the Customer information. */
["CustomerUpdateInput"]: {
		/** The customer’s first name. */
	firstName?: string | undefined,
	/** The customer’s last name. */
	lastName?: string | undefined,
	/** The customer’s email. */
	email?: string | undefined,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_. To remove the phone number, specify `null`.
 */
	phone?: string | undefined,
	/** The login password used by the customer. */
	password?: string | undefined,
	/** Indicates whether the customer has consented to be sent marketing material via email. */
	acceptsMarketing?: boolean | undefined
};
	/** Return type for `customerUpdate` mutation. */
["CustomerUpdatePayload"]: {
	__typename: "CustomerUpdatePayload",
	/** The updated customer object. */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** The newly created customer access token. If the customer's password is updated, all previous access tokens
(including the one used to perform this mutation) become invalid, and a new token is generated.
 */
	customerAccessToken?: GraphQLTypes["CustomerAccessToken"] | undefined,
	/** The list of errors that occurred from executing the mutation. */
	customerUserErrors: Array<GraphQLTypes["CustomerUserError"]>,
	/** The list of errors that occurred from executing the mutation. */
	userErrors: Array<GraphQLTypes["UserError"]>
};
	/** Represents an error that happens during execution of a customer mutation. */
["CustomerUserError"]: {
	__typename: "CustomerUserError",
	/** The error code. */
	code?: GraphQLTypes["CustomerErrorCode"] | undefined,
	/** The path to the input field that caused the error. */
	field?: Array<string> | undefined,
	/** The error message. */
	message: string
};
	/** Represents an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)-encoded date and time string.
For example, 3:50 pm on September 7, 2019 in the time zone of UTC (Coordinated Universal Time) is
represented as `"2019-09-07T15:50:00Z`".
 */
["DateTime"]: "scalar" & { name: "DateTime" };
	/** A signed decimal number, which supports arbitrary precision and is serialized as a string.

Example values: `"29.99"`, `"29.999"`.
 */
["Decimal"]: "scalar" & { name: "Decimal" };
	/** A delivery address of the buyer that is interacting with the cart. */
["DeliveryAddress"]:{
        	__typename:"MailingAddress"
        	['...on MailingAddress']: '__union' & GraphQLTypes["MailingAddress"];
};
	/** The input fields for delivery address preferences.
 */
["DeliveryAddressInput"]: {
		/** A delivery address preference of a buyer that is interacting with the cart. */
	deliveryAddress?: GraphQLTypes["MailingAddressInput"] | undefined
};
	/** List of different delivery method types. */
["DeliveryMethodType"]: DeliveryMethodType;
	/** Digital wallet, such as Apple Pay, which can be used for accelerated checkouts. */
["DigitalWallet"]: DigitalWallet;
	/** An amount discounting the line that has been allocated by a discount.
 */
["DiscountAllocation"]: {
	__typename: "DiscountAllocation",
	/** Amount of discount allocated. */
	allocatedAmount: GraphQLTypes["MoneyV2"],
	/** The discount this allocated amount originated from. */
	discountApplication: GraphQLTypes["DiscountApplication"]
};
	/** Discount applications capture the intentions of a discount source at
the time of application.
 */
["DiscountApplication"]: {
	__typename:"AutomaticDiscountApplication" | "DiscountCodeApplication" | "ManualDiscountApplication" | "ScriptDiscountApplication",
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod: GraphQLTypes["DiscountApplicationAllocationMethod"],
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection: GraphQLTypes["DiscountApplicationTargetSelection"],
	/** The type of line that the discount is applicable towards. */
	targetType: GraphQLTypes["DiscountApplicationTargetType"],
	/** The value of the discount application. */
	value: GraphQLTypes["PricingValue"]
	['...on AutomaticDiscountApplication']: '__union' & GraphQLTypes["AutomaticDiscountApplication"];
	['...on DiscountCodeApplication']: '__union' & GraphQLTypes["DiscountCodeApplication"];
	['...on ManualDiscountApplication']: '__union' & GraphQLTypes["ManualDiscountApplication"];
	['...on ScriptDiscountApplication']: '__union' & GraphQLTypes["ScriptDiscountApplication"];
};
	/** The method by which the discount's value is allocated onto its entitled lines. */
["DiscountApplicationAllocationMethod"]: DiscountApplicationAllocationMethod;
	/** An auto-generated type for paginating through multiple DiscountApplications.
 */
["DiscountApplicationConnection"]: {
	__typename: "DiscountApplicationConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["DiscountApplicationEdge"]>,
	/** A list of the nodes contained in DiscountApplicationEdge. */
	nodes: Array<GraphQLTypes["DiscountApplication"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one DiscountApplication and a cursor during pagination.
 */
["DiscountApplicationEdge"]: {
	__typename: "DiscountApplicationEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of DiscountApplicationEdge. */
	node: GraphQLTypes["DiscountApplication"]
};
	/** The lines on the order to which the discount is applied, of the type defined by
the discount application's `targetType`. For example, the value `ENTITLED`, combined with a `targetType` of
`LINE_ITEM`, applies the discount on all line items that are entitled to the discount.
The value `ALL`, combined with a `targetType` of `SHIPPING_LINE`, applies the discount on all shipping lines.
 */
["DiscountApplicationTargetSelection"]: DiscountApplicationTargetSelection;
	/** The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards.
 */
["DiscountApplicationTargetType"]: DiscountApplicationTargetType;
	/** Discount code applications capture the intentions of a discount code at
the time that it is applied.
 */
["DiscountCodeApplication"]: {
	__typename: "DiscountCodeApplication",
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod: GraphQLTypes["DiscountApplicationAllocationMethod"],
	/** Specifies whether the discount code was applied successfully. */
	applicable: boolean,
	/** The string identifying the discount code that was used at the time of application. */
	code: string,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection: GraphQLTypes["DiscountApplicationTargetSelection"],
	/** The type of line that the discount is applicable towards. */
	targetType: GraphQLTypes["DiscountApplicationTargetType"],
	/** The value of the discount application. */
	value: GraphQLTypes["PricingValue"]
};
	/** Represents an error in the input of a mutation. */
["DisplayableError"]: {
	__typename:"CartUserError" | "CheckoutUserError" | "CustomerUserError" | "UserError",
	/** The path to the input field that caused the error. */
	field?: Array<string> | undefined,
	/** The error message. */
	message: string
	['...on CartUserError']: '__union' & GraphQLTypes["CartUserError"];
	['...on CheckoutUserError']: '__union' & GraphQLTypes["CheckoutUserError"];
	['...on CustomerUserError']: '__union' & GraphQLTypes["CustomerUserError"];
	['...on UserError']: '__union' & GraphQLTypes["UserError"];
};
	/** Represents a web address. */
["Domain"]: {
	__typename: "Domain",
	/** The host name of the domain (eg: `example.com`). */
	host: string,
	/** Whether SSL is enabled or not. */
	sslEnabled: boolean,
	/** The URL of the domain (eg: `https://example.com`). */
	url: GraphQLTypes["URL"]
};
	/** Represents a video hosted outside of Shopify. */
["ExternalVideo"]: {
	__typename: "ExternalVideo",
	/** A word or phrase to share the nature or contents of a media. */
	alt?: string | undefined,
	/** The embed URL of the video for the respective host. */
	embedUrl: GraphQLTypes["URL"],
	/** The URL. */
	embeddedUrl: GraphQLTypes["URL"],
	/** The host of the external video. */
	host: GraphQLTypes["MediaHost"],
	/** A globally-unique ID. */
	id: string,
	/** The media content type. */
	mediaContentType: GraphQLTypes["MediaContentType"],
	/** The origin URL of the video on the respective host. */
	originUrl: GraphQLTypes["URL"],
	/** The preview image for the media. */
	previewImage?: GraphQLTypes["Image"] | undefined
};
	/** A filter that is supported on the parent field. */
["Filter"]: {
	__typename: "Filter",
	/** A unique identifier. */
	id: string,
	/** A human-friendly string for this filter. */
	label: string,
	/** An enumeration that denotes the type of data this filter represents. */
	type: GraphQLTypes["FilterType"],
	/** The list of values for this filter. */
	values: Array<GraphQLTypes["FilterValue"]>
};
	/** The type of data that the filter group represents.

For more information, refer to [Filter products in a collection with the Storefront API]
(https://shopify.dev/custom-storefronts/products-collections/filter-products).
 */
["FilterType"]: FilterType;
	/** A selectable value within a filter. */
["FilterValue"]: {
	__typename: "FilterValue",
	/** The number of results that match this filter value. */
	count: number,
	/** A unique identifier. */
	id: string,
	/** An input object that can be used to filter by this value on the parent field.

The value is provided as a helper for building dynamic filtering UI. For example, if you have a list of selected `FilterValue` objects, you can combine their respective `input` values to use in a subsequent query.
 */
	input: GraphQLTypes["JSON"],
	/** A human-friendly string for this filter value. */
	label: string
};
	/** Represents a single fulfillment in an order. */
["Fulfillment"]: {
	__typename: "Fulfillment",
	/** List of the fulfillment's line items. */
	fulfillmentLineItems: GraphQLTypes["FulfillmentLineItemConnection"],
	/** The name of the tracking company. */
	trackingCompany?: string | undefined,
	/** Tracking information associated with the fulfillment,
such as the tracking number and tracking URL.
 */
	trackingInfo: Array<GraphQLTypes["FulfillmentTrackingInfo"]>
};
	/** Represents a single line item in a fulfillment. There is at most one fulfillment line item for each order line item. */
["FulfillmentLineItem"]: {
	__typename: "FulfillmentLineItem",
	/** The associated order's line item. */
	lineItem: GraphQLTypes["OrderLineItem"],
	/** The amount fulfilled in this fulfillment. */
	quantity: number
};
	/** An auto-generated type for paginating through multiple FulfillmentLineItems.
 */
["FulfillmentLineItemConnection"]: {
	__typename: "FulfillmentLineItemConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["FulfillmentLineItemEdge"]>,
	/** A list of the nodes contained in FulfillmentLineItemEdge. */
	nodes: Array<GraphQLTypes["FulfillmentLineItem"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one FulfillmentLineItem and a cursor during pagination.
 */
["FulfillmentLineItemEdge"]: {
	__typename: "FulfillmentLineItemEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of FulfillmentLineItemEdge. */
	node: GraphQLTypes["FulfillmentLineItem"]
};
	/** Tracking information associated with the fulfillment. */
["FulfillmentTrackingInfo"]: {
	__typename: "FulfillmentTrackingInfo",
	/** The tracking number of the fulfillment. */
	number?: string | undefined,
	/** The URL to track the fulfillment. */
	url?: GraphQLTypes["URL"] | undefined
};
	/** The generic file resource lets you manage files in a merchant’s store. Generic files include any file that doesn’t fit into a designated type such as image or video. Example: PDF, JSON. */
["GenericFile"]: {
	__typename: "GenericFile",
	/** A word or phrase to indicate the contents of a file. */
	alt?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The MIME type of the file. */
	mimeType?: string | undefined,
	/** The size of the original file in bytes. */
	originalFileSize?: number | undefined,
	/** The preview image for the file. */
	previewImage?: GraphQLTypes["Image"] | undefined,
	/** The URL of the file. */
	url?: GraphQLTypes["URL"] | undefined
};
	/** The input fields used to specify a geographical location. */
["GeoCoordinateInput"]: {
		/** The coordinate's latitude value. */
	latitude: number,
	/** The coordinate's longitude value. */
	longitude: number
};
	/** A string containing HTML code. Refer to the [HTML spec](https://html.spec.whatwg.org/#elements-3) for a
complete list of HTML elements.

Example value: `"<p>Grey cotton knit sweater.</p>"`
 */
["HTML"]: "scalar" & { name: "HTML" };
	/** Represents information about the metafields associated to the specified resource. */
["HasMetafields"]: {
	__typename:"Article" | "Blog" | "Collection" | "Customer" | "Order" | "Page" | "Product" | "ProductVariant" | "Shop",
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>
	['...on Article']: '__union' & GraphQLTypes["Article"];
	['...on Blog']: '__union' & GraphQLTypes["Blog"];
	['...on Collection']: '__union' & GraphQLTypes["Collection"];
	['...on Customer']: '__union' & GraphQLTypes["Customer"];
	['...on Order']: '__union' & GraphQLTypes["Order"];
	['...on Page']: '__union' & GraphQLTypes["Page"];
	['...on Product']: '__union' & GraphQLTypes["Product"];
	['...on ProductVariant']: '__union' & GraphQLTypes["ProductVariant"];
	['...on Shop']: '__union' & GraphQLTypes["Shop"];
};
	/** The input fields to identify a metafield on an owner resource by namespace and key. */
["HasMetafieldsIdentifier"]: {
		/** A container for a set of metafields. */
	namespace: string,
	/** The identifier for the metafield. */
	key: string
};
	/** Represents an image resource. */
["Image"]: {
	__typename: "Image",
	/** A word or phrase to share the nature or contents of an image. */
	altText?: string | undefined,
	/** The original height of the image in pixels. Returns `null` if the image is not hosted by Shopify. */
	height?: number | undefined,
	/** A unique ID for the image. */
	id?: string | undefined,
	/** The location of the original image as a URL.

If there are any existing transformations in the original source URL, they will remain and not be stripped.
 */
	originalSrc: GraphQLTypes["URL"],
	/** The location of the image as a URL. */
	src: GraphQLTypes["URL"],
	/** The location of the transformed image as a URL.

All transformation arguments are considered "best-effort". If they can be applied to an image, they will be.
Otherwise any transformations which an image type does not support will be ignored.
 */
	transformedSrc: GraphQLTypes["URL"],
	/** The location of the image as a URL.

If no transform options are specified, then the original image will be preserved including any pre-applied transforms.

All transformation options are considered "best-effort". Any transformation that the original image type doesn't support will be ignored.

If you need multiple variations of the same image, then you can use [GraphQL aliases](https://graphql.org/learn/queries/#aliases).
 */
	url: GraphQLTypes["URL"],
	/** The original width of the image in pixels. Returns `null` if the image is not hosted by Shopify. */
	width?: number | undefined
};
	/** An auto-generated type for paginating through multiple Images.
 */
["ImageConnection"]: {
	__typename: "ImageConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["ImageEdge"]>,
	/** A list of the nodes contained in ImageEdge. */
	nodes: Array<GraphQLTypes["Image"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** List of supported image content types. */
["ImageContentType"]: ImageContentType;
	/** An auto-generated type which holds one Image and a cursor during pagination.
 */
["ImageEdge"]: {
	__typename: "ImageEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of ImageEdge. */
	node: GraphQLTypes["Image"]
};
	/** The available options for transforming an image.

All transformation options are considered best effort. Any transformation that the original image type doesn't support will be ignored.
 */
["ImageTransformInput"]: {
		/** The region of the image to remain after cropping.
Must be used in conjunction with the `maxWidth` and/or `maxHeight` fields, where the `maxWidth` and `maxHeight` aren't equal.
The `crop` argument should coincide with the smaller value. A smaller `maxWidth` indicates a `LEFT` or `RIGHT` crop, while
a smaller `maxHeight` indicates a `TOP` or `BOTTOM` crop. For example, `{ maxWidth: 5, maxHeight: 10, crop: LEFT }` will result
in an image with a width of 5 and height of 10, where the right side of the image is removed.
 */
	crop?: GraphQLTypes["CropRegion"] | undefined,
	/** Image width in pixels between 1 and 5760.
 */
	maxWidth?: number | undefined,
	/** Image height in pixels between 1 and 5760.
 */
	maxHeight?: number | undefined,
	/** Image size multiplier for high-resolution retina displays. Must be within 1..3.
 */
	scale?: number | undefined,
	/** Convert the source image into the preferred content type.
Supported conversions: `.svg` to `.png`, any file type to `.jpg`, and any file type to `.webp`.
 */
	preferredContentType?: GraphQLTypes["ImageContentType"] | undefined
};
	/** A [JSON](https://www.json.org/json-en.html) object.

Example value:
`{
  "product": {
    "id": "gid://shopify/Product/1346443542550",
    "title": "White T-shirt",
    "options": [{
      "name": "Size",
      "values": ["M", "L"]
    }]
  }
}`
 */
["JSON"]: "scalar" & { name: "JSON" };
	/** A language. */
["Language"]: {
	__typename: "Language",
	/** The name of the language in the language itself. If the language uses capitalization, it is capitalized for a mid-sentence position. */
	endonymName: string,
	/** The ISO code. */
	isoCode: GraphQLTypes["LanguageCode"],
	/** The name of the language in the current language. */
	name: string
};
	/** ISO 639-1 language codes supported by Shopify. */
["LanguageCode"]: LanguageCode;
	/** Information about the localized experiences configured for the shop. */
["Localization"]: {
	__typename: "Localization",
	/** The list of countries with enabled localized experiences. */
	availableCountries: Array<GraphQLTypes["Country"]>,
	/** The list of languages available for the active country. */
	availableLanguages: Array<GraphQLTypes["Language"]>,
	/** The country of the active localized experience. Use the `@inContext` directive to change this value. */
	country: GraphQLTypes["Country"],
	/** The language of the active localized experience. Use the `@inContext` directive to change this value. */
	language: GraphQLTypes["Language"]
};
	/** Represents a location where product inventory is held. */
["Location"]: {
	__typename: "Location",
	/** The address of the location. */
	address: GraphQLTypes["LocationAddress"],
	/** A globally-unique ID. */
	id: string,
	/** The name of the location. */
	name: string
};
	/** Represents the address of a location.
 */
["LocationAddress"]: {
	__typename: "LocationAddress",
	/** The first line of the address for the location. */
	address1?: string | undefined,
	/** The second line of the address for the location. */
	address2?: string | undefined,
	/** The city of the location. */
	city?: string | undefined,
	/** The country of the location. */
	country?: string | undefined,
	/** The country code of the location. */
	countryCode?: string | undefined,
	/** A formatted version of the address for the location. */
	formatted: Array<string>,
	/** The latitude coordinates of the location. */
	latitude?: number | undefined,
	/** The longitude coordinates of the location. */
	longitude?: number | undefined,
	/** The phone number of the location. */
	phone?: string | undefined,
	/** The province of the location. */
	province?: string | undefined,
	/** The code for the province, state, or district of the address of the location.
 */
	provinceCode?: string | undefined,
	/** The ZIP code of the location. */
	zip?: string | undefined
};
	/** An auto-generated type for paginating through multiple Locations.
 */
["LocationConnection"]: {
	__typename: "LocationConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["LocationEdge"]>,
	/** A list of the nodes contained in LocationEdge. */
	nodes: Array<GraphQLTypes["Location"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one Location and a cursor during pagination.
 */
["LocationEdge"]: {
	__typename: "LocationEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of LocationEdge. */
	node: GraphQLTypes["Location"]
};
	/** The set of valid sort keys for the Location query. */
["LocationSortKeys"]: LocationSortKeys;
	/** Represents a mailing address for customers and shipping. */
["MailingAddress"]: {
	__typename: "MailingAddress",
	/** The first line of the address. Typically the street address or PO Box number. */
	address1?: string | undefined,
	/** The second line of the address. Typically the number of the apartment, suite, or unit.
 */
	address2?: string | undefined,
	/** The name of the city, district, village, or town.
 */
	city?: string | undefined,
	/** The name of the customer's company or organization.
 */
	company?: string | undefined,
	/** The name of the country.
 */
	country?: string | undefined,
	/** The two-letter code for the country of the address.

For example, US.
 */
	countryCode?: string | undefined,
	/** The two-letter code for the country of the address.

For example, US.
 */
	countryCodeV2?: GraphQLTypes["CountryCode"] | undefined,
	/** The first name of the customer. */
	firstName?: string | undefined,
	/** A formatted version of the address, customized by the provided arguments. */
	formatted: Array<string>,
	/** A comma-separated list of the values for city, province, and country. */
	formattedArea?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The last name of the customer. */
	lastName?: string | undefined,
	/** The latitude coordinate of the customer address. */
	latitude?: number | undefined,
	/** The longitude coordinate of the customer address. */
	longitude?: number | undefined,
	/** The full name of the customer, based on firstName and lastName.
 */
	name?: string | undefined,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined,
	/** The region of the address, such as the province, state, or district. */
	province?: string | undefined,
	/** The two-letter code for the region.

For example, ON.
 */
	provinceCode?: string | undefined,
	/** The zip or postal code of the address. */
	zip?: string | undefined
};
	/** An auto-generated type for paginating through multiple MailingAddresses.
 */
["MailingAddressConnection"]: {
	__typename: "MailingAddressConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["MailingAddressEdge"]>,
	/** A list of the nodes contained in MailingAddressEdge. */
	nodes: Array<GraphQLTypes["MailingAddress"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one MailingAddress and a cursor during pagination.
 */
["MailingAddressEdge"]: {
	__typename: "MailingAddressEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of MailingAddressEdge. */
	node: GraphQLTypes["MailingAddress"]
};
	/** The input fields to create or update a mailing address. */
["MailingAddressInput"]: {
		/** The first line of the address. Typically the street address or PO Box number.
 */
	address1?: string | undefined,
	/** The second line of the address. Typically the number of the apartment, suite, or unit.
 */
	address2?: string | undefined,
	/** The name of the city, district, village, or town.
 */
	city?: string | undefined,
	/** The name of the customer's company or organization.
 */
	company?: string | undefined,
	/** The name of the country. */
	country?: string | undefined,
	/** The first name of the customer. */
	firstName?: string | undefined,
	/** The last name of the customer. */
	lastName?: string | undefined,
	/** A unique phone number for the customer.

Formatted using E.164 standard. For example, _+16135551111_.
 */
	phone?: string | undefined,
	/** The region of the address, such as the province, state, or district. */
	province?: string | undefined,
	/** The zip or postal code of the address. */
	zip?: string | undefined
};
	/** Manual discount applications capture the intentions of a discount that was manually created.
 */
["ManualDiscountApplication"]: {
	__typename: "ManualDiscountApplication",
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod: GraphQLTypes["DiscountApplicationAllocationMethod"],
	/** The description of the application. */
	description?: string | undefined,
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection: GraphQLTypes["DiscountApplicationTargetSelection"],
	/** The type of line that the discount is applicable towards. */
	targetType: GraphQLTypes["DiscountApplicationTargetType"],
	/** The title of the application. */
	title: string,
	/** The value of the discount application. */
	value: GraphQLTypes["PricingValue"]
};
	/** Represents a media interface. */
["Media"]: {
	__typename:"ExternalVideo" | "MediaImage" | "Model3d" | "Video",
	/** A word or phrase to share the nature or contents of a media. */
	alt?: string | undefined,
	/** The media content type. */
	mediaContentType: GraphQLTypes["MediaContentType"],
	/** The preview image for the media. */
	previewImage?: GraphQLTypes["Image"] | undefined
	['...on ExternalVideo']: '__union' & GraphQLTypes["ExternalVideo"];
	['...on MediaImage']: '__union' & GraphQLTypes["MediaImage"];
	['...on Model3d']: '__union' & GraphQLTypes["Model3d"];
	['...on Video']: '__union' & GraphQLTypes["Video"];
};
	/** An auto-generated type for paginating through multiple Media.
 */
["MediaConnection"]: {
	__typename: "MediaConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["MediaEdge"]>,
	/** A list of the nodes contained in MediaEdge. */
	nodes: Array<GraphQLTypes["Media"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** The possible content types for a media object. */
["MediaContentType"]: MediaContentType;
	/** An auto-generated type which holds one Media and a cursor during pagination.
 */
["MediaEdge"]: {
	__typename: "MediaEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of MediaEdge. */
	node: GraphQLTypes["Media"]
};
	/** Host for a Media Resource. */
["MediaHost"]: MediaHost;
	/** Represents a Shopify hosted image. */
["MediaImage"]: {
	__typename: "MediaImage",
	/** A word or phrase to share the nature or contents of a media. */
	alt?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The image for the media. */
	image?: GraphQLTypes["Image"] | undefined,
	/** The media content type. */
	mediaContentType: GraphQLTypes["MediaContentType"],
	/** The preview image for the media. */
	previewImage?: GraphQLTypes["Image"] | undefined
};
	/** A [navigation menu](https://help.shopify.com/manual/online-store/menus-and-links) representing a hierarchy
of hyperlinks (items).
 */
["Menu"]: {
	__typename: "Menu",
	/** The menu's handle. */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** The menu's child items. */
	items: Array<GraphQLTypes["MenuItem"]>,
	/** The count of items on the menu. */
	itemsCount: number,
	/** The menu's title. */
	title: string
};
	/** A menu item within a parent menu.
 */
["MenuItem"]: {
	__typename: "MenuItem",
	/** A globally-unique ID. */
	id: string,
	/** The menu item's child items. */
	items: Array<GraphQLTypes["MenuItem"]>,
	/** The ID of the linked resource. */
	resourceId?: string | undefined,
	/** The menu item's tags to filter a collection. */
	tags: Array<string>,
	/** The menu item's title. */
	title: string,
	/** The menu item's type. */
	type: GraphQLTypes["MenuItemType"],
	/** The menu item's URL. */
	url?: GraphQLTypes["URL"] | undefined
};
	/** A menu item type. */
["MenuItemType"]: MenuItemType;
	/** The merchandise to be purchased at checkout. */
["Merchandise"]:{
        	__typename:"ProductVariant"
        	['...on ProductVariant']: '__union' & GraphQLTypes["ProductVariant"];
};
	/** Metafields represent custom metadata attached to a resource. Metafields can be sorted into namespaces and are
comprised of keys, values, and value types.
 */
["Metafield"]: {
	__typename: "Metafield",
	/** The date and time when the storefront metafield was created. */
	createdAt: GraphQLTypes["DateTime"],
	/** The description of a metafield. */
	description?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The unique identifier for the metafield within its namespace. */
	key: string,
	/** The container for a group of metafields that the metafield is associated with. */
	namespace: string,
	/** The type of resource that the metafield is attached to. */
	parentResource: GraphQLTypes["MetafieldParentResource"],
	/** Returns a reference object if the metafield's type is a resource reference. */
	reference?: GraphQLTypes["MetafieldReference"] | undefined,
	/** A list of reference objects if the metafield's type is a resource reference list. */
	references?: GraphQLTypes["MetafieldReferenceConnection"] | undefined,
	/** The type name of the metafield.
Refer to the list of [supported types](https://shopify.dev/apps/metafields/definitions/types).
 */
	type: string,
	/** The date and time when the metafield was last updated. */
	updatedAt: GraphQLTypes["DateTime"],
	/** The data stored in the metafield. Always stored as a string, regardless of the metafield's type. */
	value: string
};
	/** A filter used to view a subset of products in a collection matching a specific metafield value.

Only the following metafield types are currently supported:
- `number_integer`
- `number_decimal`
- `single_line_text_field`
- `boolean` as of 2022-04.
 */
["MetafieldFilter"]: {
		/** The namespace of the metafield to filter on. */
	namespace: string,
	/** The key of the metafield to filter on. */
	key: string,
	/** The value of the metafield. */
	value: string
};
	/** A resource that the metafield belongs to. */
["MetafieldParentResource"]:{
        	__typename:"Article" | "Blog" | "Collection" | "Customer" | "Order" | "Page" | "Product" | "ProductVariant" | "Shop"
        	['...on Article']: '__union' & GraphQLTypes["Article"];
	['...on Blog']: '__union' & GraphQLTypes["Blog"];
	['...on Collection']: '__union' & GraphQLTypes["Collection"];
	['...on Customer']: '__union' & GraphQLTypes["Customer"];
	['...on Order']: '__union' & GraphQLTypes["Order"];
	['...on Page']: '__union' & GraphQLTypes["Page"];
	['...on Product']: '__union' & GraphQLTypes["Product"];
	['...on ProductVariant']: '__union' & GraphQLTypes["ProductVariant"];
	['...on Shop']: '__union' & GraphQLTypes["Shop"];
};
	/** Returns the resource which is being referred to by a metafield.
 */
["MetafieldReference"]:{
        	__typename:"Collection" | "GenericFile" | "MediaImage" | "Metaobject" | "Page" | "Product" | "ProductVariant" | "Video"
        	['...on Collection']: '__union' & GraphQLTypes["Collection"];
	['...on GenericFile']: '__union' & GraphQLTypes["GenericFile"];
	['...on MediaImage']: '__union' & GraphQLTypes["MediaImage"];
	['...on Metaobject']: '__union' & GraphQLTypes["Metaobject"];
	['...on Page']: '__union' & GraphQLTypes["Page"];
	['...on Product']: '__union' & GraphQLTypes["Product"];
	['...on ProductVariant']: '__union' & GraphQLTypes["ProductVariant"];
	['...on Video']: '__union' & GraphQLTypes["Video"];
};
	/** An auto-generated type for paginating through multiple MetafieldReferences.
 */
["MetafieldReferenceConnection"]: {
	__typename: "MetafieldReferenceConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["MetafieldReferenceEdge"]>,
	/** A list of the nodes contained in MetafieldReferenceEdge. */
	nodes: Array<GraphQLTypes["MetafieldReference"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one MetafieldReference and a cursor during pagination.
 */
["MetafieldReferenceEdge"]: {
	__typename: "MetafieldReferenceEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of MetafieldReferenceEdge. */
	node: GraphQLTypes["MetafieldReference"]
};
	/** An instance of a user-defined model based on a MetaobjectDefinition. */
["Metaobject"]: {
	__typename: "Metaobject",
	/** Accesses a field of the object by key. */
	field?: GraphQLTypes["MetaobjectField"] | undefined,
	/** All object fields with defined values.
Omitted object keys can be assumed null, and no guarantees are made about field order.
 */
	fields: Array<GraphQLTypes["MetaobjectField"]>,
	/** The unique handle of the metaobject. Useful as a custom ID. */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** The type of the metaobject. Defines the namespace of its associated metafields. */
	type: string,
	/** The date and time when the metaobject was last updated. */
	updatedAt: GraphQLTypes["DateTime"]
};
	/** An auto-generated type for paginating through multiple Metaobjects.
 */
["MetaobjectConnection"]: {
	__typename: "MetaobjectConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["MetaobjectEdge"]>,
	/** A list of the nodes contained in MetaobjectEdge. */
	nodes: Array<GraphQLTypes["Metaobject"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one Metaobject and a cursor during pagination.
 */
["MetaobjectEdge"]: {
	__typename: "MetaobjectEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of MetaobjectEdge. */
	node: GraphQLTypes["Metaobject"]
};
	/** Provides the value of a Metaobject field. */
["MetaobjectField"]: {
	__typename: "MetaobjectField",
	/** The field key. */
	key: string,
	/** A referenced object if the field type is a resource reference. */
	reference?: GraphQLTypes["MetafieldReference"] | undefined,
	/** A list of referenced objects if the field type is a resource reference list. */
	references?: GraphQLTypes["MetafieldReferenceConnection"] | undefined,
	/** The type name of the field.
See the list of [supported types](https://shopify.dev/apps/metafields/definitions/types).
 */
	type: string,
	/** The field value. */
	value?: string | undefined
};
	/** The input fields used to retrieve a metaobject by handle. */
["MetaobjectHandleInput"]: {
		/** The handle of the metaobject. */
	handle: string,
	/** The type of the metaobject. */
	type: string
};
	/** Represents a Shopify hosted 3D model. */
["Model3d"]: {
	__typename: "Model3d",
	/** A word or phrase to share the nature or contents of a media. */
	alt?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The media content type. */
	mediaContentType: GraphQLTypes["MediaContentType"],
	/** The preview image for the media. */
	previewImage?: GraphQLTypes["Image"] | undefined,
	/** The sources for a 3d model. */
	sources: Array<GraphQLTypes["Model3dSource"]>
};
	/** Represents a source for a Shopify hosted 3d model. */
["Model3dSource"]: {
	__typename: "Model3dSource",
	/** The filesize of the 3d model. */
	filesize: number,
	/** The format of the 3d model. */
	format: string,
	/** The MIME type of the 3d model. */
	mimeType: string,
	/** The URL of the 3d model. */
	url: string
};
	/** The input fields for a monetary value with currency. */
["MoneyInput"]: {
		/** Decimal money amount. */
	amount: GraphQLTypes["Decimal"],
	/** Currency of the money. */
	currencyCode: GraphQLTypes["CurrencyCode"]
};
	/** A monetary value with currency.
 */
["MoneyV2"]: {
	__typename: "MoneyV2",
	/** Decimal money amount. */
	amount: GraphQLTypes["Decimal"],
	/** Currency of the money. */
	currencyCode: GraphQLTypes["CurrencyCode"]
};
	/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
["Mutation"]: {
	__typename: "Mutation",
	/** Updates the attributes on a cart. */
	cartAttributesUpdate?: GraphQLTypes["CartAttributesUpdatePayload"] | undefined,
	/** Updates customer information associated with a cart.
Buyer identity is used to determine
[international pricing](https://shopify.dev/custom-storefronts/internationalization/international-pricing)
and should match the customer's shipping address.
 */
	cartBuyerIdentityUpdate?: GraphQLTypes["CartBuyerIdentityUpdatePayload"] | undefined,
	/** Creates a new cart. */
	cartCreate?: GraphQLTypes["CartCreatePayload"] | undefined,
	/** Updates the discount codes applied to the cart. */
	cartDiscountCodesUpdate?: GraphQLTypes["CartDiscountCodesUpdatePayload"] | undefined,
	/** Adds a merchandise line to the cart. */
	cartLinesAdd?: GraphQLTypes["CartLinesAddPayload"] | undefined,
	/** Removes one or more merchandise lines from the cart. */
	cartLinesRemove?: GraphQLTypes["CartLinesRemovePayload"] | undefined,
	/** Updates one or more merchandise lines on a cart. */
	cartLinesUpdate?: GraphQLTypes["CartLinesUpdatePayload"] | undefined,
	/** Updates the note on the cart. */
	cartNoteUpdate?: GraphQLTypes["CartNoteUpdatePayload"] | undefined,
	/** Update the selected delivery options for a delivery group. */
	cartSelectedDeliveryOptionsUpdate?: GraphQLTypes["CartSelectedDeliveryOptionsUpdatePayload"] | undefined,
	/** Updates the attributes of a checkout if `allowPartialAddresses` is `true`. */
	checkoutAttributesUpdateV2?: GraphQLTypes["CheckoutAttributesUpdateV2Payload"] | undefined,
	/** Completes a checkout without providing payment information. You can use this mutation for free items or items whose purchase price is covered by a gift card. */
	checkoutCompleteFree?: GraphQLTypes["CheckoutCompleteFreePayload"] | undefined,
	/** Completes a checkout using a credit card token from Shopify's card vault. Before you can complete checkouts using CheckoutCompleteWithCreditCardV2, you need to  [_request payment processing_](https://shopify.dev/apps/channels/getting-started#request-payment-processing). */
	checkoutCompleteWithCreditCardV2?: GraphQLTypes["CheckoutCompleteWithCreditCardV2Payload"] | undefined,
	/** Completes a checkout with a tokenized payment. */
	checkoutCompleteWithTokenizedPaymentV3?: GraphQLTypes["CheckoutCompleteWithTokenizedPaymentV3Payload"] | undefined,
	/** Creates a new checkout. */
	checkoutCreate?: GraphQLTypes["CheckoutCreatePayload"] | undefined,
	/** Associates a customer to the checkout. */
	checkoutCustomerAssociateV2?: GraphQLTypes["CheckoutCustomerAssociateV2Payload"] | undefined,
	/** Disassociates the current checkout customer from the checkout. */
	checkoutCustomerDisassociateV2?: GraphQLTypes["CheckoutCustomerDisassociateV2Payload"] | undefined,
	/** Applies a discount to an existing checkout using a discount code. */
	checkoutDiscountCodeApplyV2?: GraphQLTypes["CheckoutDiscountCodeApplyV2Payload"] | undefined,
	/** Removes the applied discounts from an existing checkout. */
	checkoutDiscountCodeRemove?: GraphQLTypes["CheckoutDiscountCodeRemovePayload"] | undefined,
	/** Updates the email on an existing checkout. */
	checkoutEmailUpdateV2?: GraphQLTypes["CheckoutEmailUpdateV2Payload"] | undefined,
	/** Removes an applied gift card from the checkout. */
	checkoutGiftCardRemoveV2?: GraphQLTypes["CheckoutGiftCardRemoveV2Payload"] | undefined,
	/** Appends gift cards to an existing checkout. */
	checkoutGiftCardsAppend?: GraphQLTypes["CheckoutGiftCardsAppendPayload"] | undefined,
	/** Adds a list of line items to a checkout. */
	checkoutLineItemsAdd?: GraphQLTypes["CheckoutLineItemsAddPayload"] | undefined,
	/** Removes line items from an existing checkout. */
	checkoutLineItemsRemove?: GraphQLTypes["CheckoutLineItemsRemovePayload"] | undefined,
	/** Sets a list of line items to a checkout. */
	checkoutLineItemsReplace?: GraphQLTypes["CheckoutLineItemsReplacePayload"] | undefined,
	/** Updates line items on a checkout. */
	checkoutLineItemsUpdate?: GraphQLTypes["CheckoutLineItemsUpdatePayload"] | undefined,
	/** Updates the shipping address of an existing checkout. */
	checkoutShippingAddressUpdateV2?: GraphQLTypes["CheckoutShippingAddressUpdateV2Payload"] | undefined,
	/** Updates the shipping lines on an existing checkout. */
	checkoutShippingLineUpdate?: GraphQLTypes["CheckoutShippingLineUpdatePayload"] | undefined,
	/** Creates a customer access token.
The customer access token is required to modify the customer object in any way.
 */
	customerAccessTokenCreate?: GraphQLTypes["CustomerAccessTokenCreatePayload"] | undefined,
	/** Creates a customer access token using a
[multipass token](https://shopify.dev/api/multipass) instead of email and
password. A customer record is created if the customer doesn't exist. If a customer
record already exists but the record is disabled, then the customer record is enabled.
 */
	customerAccessTokenCreateWithMultipass?: GraphQLTypes["CustomerAccessTokenCreateWithMultipassPayload"] | undefined,
	/** Permanently destroys a customer access token. */
	customerAccessTokenDelete?: GraphQLTypes["CustomerAccessTokenDeletePayload"] | undefined,
	/** Renews a customer access token.

Access token renewal must happen *before* a token expires.
If a token has already expired, a new one should be created instead via `customerAccessTokenCreate`.
 */
	customerAccessTokenRenew?: GraphQLTypes["CustomerAccessTokenRenewPayload"] | undefined,
	/** Activates a customer. */
	customerActivate?: GraphQLTypes["CustomerActivatePayload"] | undefined,
	/** Activates a customer with the activation url received from `customerCreate`. */
	customerActivateByUrl?: GraphQLTypes["CustomerActivateByUrlPayload"] | undefined,
	/** Creates a new address for a customer. */
	customerAddressCreate?: GraphQLTypes["CustomerAddressCreatePayload"] | undefined,
	/** Permanently deletes the address of an existing customer. */
	customerAddressDelete?: GraphQLTypes["CustomerAddressDeletePayload"] | undefined,
	/** Updates the address of an existing customer. */
	customerAddressUpdate?: GraphQLTypes["CustomerAddressUpdatePayload"] | undefined,
	/** Creates a new customer. */
	customerCreate?: GraphQLTypes["CustomerCreatePayload"] | undefined,
	/** Updates the default address of an existing customer. */
	customerDefaultAddressUpdate?: GraphQLTypes["CustomerDefaultAddressUpdatePayload"] | undefined,
	/** Sends a reset password email to the customer. The reset password
email contains a reset password URL and token that you can pass to
the [`customerResetByUrl`](https://shopify.dev/api/storefront/latest/mutations/customerResetByUrl) or
[`customerReset`](https://shopify.dev/api/storefront/latest/mutations/customerReset) mutation to reset the
customer password.

This mutation is throttled by IP. With authenticated access,
you can provide a [`Shopify-Storefront-Buyer-IP`](https://shopify.dev/api/usage/authentication#optional-ip-header) instead of the request IP.

Make sure that the value provided to `Shopify-Storefront-Buyer-IP` is trusted. Unthrottled access to this
mutation presents a security risk.
 */
	customerRecover?: GraphQLTypes["CustomerRecoverPayload"] | undefined,
	/** "Resets a customer’s password with the token received from a reset password email. You can send a reset password email with the [`customerRecover`](https://shopify.dev/api/storefront/latest/mutations/customerRecover) mutation."
 */
	customerReset?: GraphQLTypes["CustomerResetPayload"] | undefined,
	/** "Resets a customer’s password with the reset password URL received from a reset password email. You can send a reset password email with the [`customerRecover`](https://shopify.dev/api/storefront/latest/mutations/customerRecover) mutation."
 */
	customerResetByUrl?: GraphQLTypes["CustomerResetByUrlPayload"] | undefined,
	/** Updates an existing customer. */
	customerUpdate?: GraphQLTypes["CustomerUpdatePayload"] | undefined
};
	/** An object with an ID field to support global identification, in accordance with the
[Relay specification](https://relay.dev/graphql/objectidentification.htm#sec-Node-Interface).
This interface is used by the [node](https://shopify.dev/api/admin-graphql/unstable/queries/node)
and [nodes](https://shopify.dev/api/admin-graphql/unstable/queries/nodes) queries.
 */
["Node"]: {
	__typename:"AppliedGiftCard" | "Article" | "Blog" | "Cart" | "CartLine" | "Checkout" | "CheckoutLineItem" | "Collection" | "Comment" | "ExternalVideo" | "GenericFile" | "Location" | "MailingAddress" | "MediaImage" | "Menu" | "MenuItem" | "Metafield" | "Metaobject" | "Model3d" | "Order" | "Page" | "Payment" | "Product" | "ProductOption" | "ProductVariant" | "Shop" | "ShopPolicy" | "UrlRedirect" | "Video",
	/** A globally-unique ID. */
	id: string
	['...on AppliedGiftCard']: '__union' & GraphQLTypes["AppliedGiftCard"];
	['...on Article']: '__union' & GraphQLTypes["Article"];
	['...on Blog']: '__union' & GraphQLTypes["Blog"];
	['...on Cart']: '__union' & GraphQLTypes["Cart"];
	['...on CartLine']: '__union' & GraphQLTypes["CartLine"];
	['...on Checkout']: '__union' & GraphQLTypes["Checkout"];
	['...on CheckoutLineItem']: '__union' & GraphQLTypes["CheckoutLineItem"];
	['...on Collection']: '__union' & GraphQLTypes["Collection"];
	['...on Comment']: '__union' & GraphQLTypes["Comment"];
	['...on ExternalVideo']: '__union' & GraphQLTypes["ExternalVideo"];
	['...on GenericFile']: '__union' & GraphQLTypes["GenericFile"];
	['...on Location']: '__union' & GraphQLTypes["Location"];
	['...on MailingAddress']: '__union' & GraphQLTypes["MailingAddress"];
	['...on MediaImage']: '__union' & GraphQLTypes["MediaImage"];
	['...on Menu']: '__union' & GraphQLTypes["Menu"];
	['...on MenuItem']: '__union' & GraphQLTypes["MenuItem"];
	['...on Metafield']: '__union' & GraphQLTypes["Metafield"];
	['...on Metaobject']: '__union' & GraphQLTypes["Metaobject"];
	['...on Model3d']: '__union' & GraphQLTypes["Model3d"];
	['...on Order']: '__union' & GraphQLTypes["Order"];
	['...on Page']: '__union' & GraphQLTypes["Page"];
	['...on Payment']: '__union' & GraphQLTypes["Payment"];
	['...on Product']: '__union' & GraphQLTypes["Product"];
	['...on ProductOption']: '__union' & GraphQLTypes["ProductOption"];
	['...on ProductVariant']: '__union' & GraphQLTypes["ProductVariant"];
	['...on Shop']: '__union' & GraphQLTypes["Shop"];
	['...on ShopPolicy']: '__union' & GraphQLTypes["ShopPolicy"];
	['...on UrlRedirect']: '__union' & GraphQLTypes["UrlRedirect"];
	['...on Video']: '__union' & GraphQLTypes["Video"];
};
	/** Represents a resource that can be published to the Online Store sales channel. */
["OnlineStorePublishable"]: {
	__typename:"Article" | "Blog" | "Collection" | "Page" | "Product",
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: GraphQLTypes["URL"] | undefined
	['...on Article']: '__union' & GraphQLTypes["Article"];
	['...on Blog']: '__union' & GraphQLTypes["Blog"];
	['...on Collection']: '__union' & GraphQLTypes["Collection"];
	['...on Page']: '__union' & GraphQLTypes["Page"];
	['...on Product']: '__union' & GraphQLTypes["Product"];
};
	/** An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process, during which time they provides an email address, billing address and payment information. */
["Order"]: {
	__typename: "Order",
	/** The reason for the order's cancellation. Returns `null` if the order wasn't canceled. */
	cancelReason?: GraphQLTypes["OrderCancelReason"] | undefined,
	/** The date and time when the order was canceled. Returns null if the order wasn't canceled. */
	canceledAt?: GraphQLTypes["DateTime"] | undefined,
	/** The code of the currency used for the payment. */
	currencyCode: GraphQLTypes["CurrencyCode"],
	/** The subtotal of line items and their discounts, excluding line items that have been removed. Does not contain order-level discounts, duties, shipping costs, or shipping discounts. Taxes are not included unless the order is a taxes-included order. */
	currentSubtotalPrice: GraphQLTypes["MoneyV2"],
	/** The total cost of duties for the order, including refunds. */
	currentTotalDuties?: GraphQLTypes["MoneyV2"] | undefined,
	/** The total amount of the order, including duties, taxes and discounts, minus amounts for line items that have been removed. */
	currentTotalPrice: GraphQLTypes["MoneyV2"],
	/** The total of all taxes applied to the order, excluding taxes for returned line items. */
	currentTotalTax: GraphQLTypes["MoneyV2"],
	/** A list of the custom attributes added to the order. */
	customAttributes: Array<GraphQLTypes["Attribute"]>,
	/** The locale code in which this specific order happened. */
	customerLocale?: string | undefined,
	/** The unique URL that the customer can use to access the order. */
	customerUrl?: GraphQLTypes["URL"] | undefined,
	/** Discounts that have been applied on the order. */
	discountApplications: GraphQLTypes["DiscountApplicationConnection"],
	/** Whether the order has had any edits applied or not. */
	edited: boolean,
	/** The customer's email address. */
	email?: string | undefined,
	/** The financial status of the order. */
	financialStatus?: GraphQLTypes["OrderFinancialStatus"] | undefined,
	/** The fulfillment status for the order. */
	fulfillmentStatus: GraphQLTypes["OrderFulfillmentStatus"],
	/** A globally-unique ID. */
	id: string,
	/** List of the order’s line items. */
	lineItems: GraphQLTypes["OrderLineItemConnection"],
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>,
	/** Unique identifier for the order that appears on the order.
For example, _#1000_ or _Store1001.
 */
	name: string,
	/** A unique numeric identifier for the order for use by shop owner and customer. */
	orderNumber: number,
	/** The total cost of duties charged at checkout. */
	originalTotalDuties?: GraphQLTypes["MoneyV2"] | undefined,
	/** The total price of the order before any applied edits. */
	originalTotalPrice: GraphQLTypes["MoneyV2"],
	/** The customer's phone number for receiving SMS notifications. */
	phone?: string | undefined,
	/** The date and time when the order was imported.
This value can be set to dates in the past when importing from other systems.
If no value is provided, it will be auto-generated based on current date and time.
 */
	processedAt: GraphQLTypes["DateTime"],
	/** The address to where the order will be shipped. */
	shippingAddress?: GraphQLTypes["MailingAddress"] | undefined,
	/** The discounts that have been allocated onto the shipping line by discount applications.
 */
	shippingDiscountAllocations: Array<GraphQLTypes["DiscountAllocation"]>,
	/** The unique URL for the order's status page. */
	statusUrl: GraphQLTypes["URL"],
	/** Price of the order before shipping and taxes. */
	subtotalPrice?: GraphQLTypes["MoneyV2"] | undefined,
	/** Price of the order before duties, shipping and taxes. */
	subtotalPriceV2?: GraphQLTypes["MoneyV2"] | undefined,
	/** List of the order’s successful fulfillments. */
	successfulFulfillments?: Array<GraphQLTypes["Fulfillment"]> | undefined,
	/** The sum of all the prices of all the items in the order, duties, taxes and discounts included (must be positive). */
	totalPrice: GraphQLTypes["MoneyV2"],
	/** The sum of all the prices of all the items in the order, duties, taxes and discounts included (must be positive). */
	totalPriceV2: GraphQLTypes["MoneyV2"],
	/** The total amount that has been refunded. */
	totalRefunded: GraphQLTypes["MoneyV2"],
	/** The total amount that has been refunded. */
	totalRefundedV2: GraphQLTypes["MoneyV2"],
	/** The total cost of shipping. */
	totalShippingPrice: GraphQLTypes["MoneyV2"],
	/** The total cost of shipping. */
	totalShippingPriceV2: GraphQLTypes["MoneyV2"],
	/** The total cost of taxes. */
	totalTax?: GraphQLTypes["MoneyV2"] | undefined,
	/** The total cost of taxes. */
	totalTaxV2?: GraphQLTypes["MoneyV2"] | undefined
};
	/** Represents the reason for the order's cancellation. */
["OrderCancelReason"]: OrderCancelReason;
	/** An auto-generated type for paginating through multiple Orders.
 */
["OrderConnection"]: {
	__typename: "OrderConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["OrderEdge"]>,
	/** A list of the nodes contained in OrderEdge. */
	nodes: Array<GraphQLTypes["Order"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"],
	/** The total count of Orders. */
	totalCount: GraphQLTypes["UnsignedInt64"]
};
	/** An auto-generated type which holds one Order and a cursor during pagination.
 */
["OrderEdge"]: {
	__typename: "OrderEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of OrderEdge. */
	node: GraphQLTypes["Order"]
};
	/** Represents the order's current financial status. */
["OrderFinancialStatus"]: OrderFinancialStatus;
	/** Represents the order's aggregated fulfillment status for display purposes. */
["OrderFulfillmentStatus"]: OrderFulfillmentStatus;
	/** Represents a single line in an order. There is one line item for each distinct product variant. */
["OrderLineItem"]: {
	__typename: "OrderLineItem",
	/** The number of entries associated to the line item minus the items that have been removed. */
	currentQuantity: number,
	/** List of custom attributes associated to the line item. */
	customAttributes: Array<GraphQLTypes["Attribute"]>,
	/** The discounts that have been allocated onto the order line item by discount applications. */
	discountAllocations: Array<GraphQLTypes["DiscountAllocation"]>,
	/** The total price of the line item, including discounts, and displayed in the presentment currency. */
	discountedTotalPrice: GraphQLTypes["MoneyV2"],
	/** The total price of the line item, not including any discounts. The total price is calculated using the original unit price multiplied by the quantity, and it is displayed in the presentment currency. */
	originalTotalPrice: GraphQLTypes["MoneyV2"],
	/** The number of products variants associated to the line item. */
	quantity: number,
	/** The title of the product combined with title of the variant. */
	title: string,
	/** The product variant object associated to the line item. */
	variant?: GraphQLTypes["ProductVariant"] | undefined
};
	/** An auto-generated type for paginating through multiple OrderLineItems.
 */
["OrderLineItemConnection"]: {
	__typename: "OrderLineItemConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["OrderLineItemEdge"]>,
	/** A list of the nodes contained in OrderLineItemEdge. */
	nodes: Array<GraphQLTypes["OrderLineItem"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one OrderLineItem and a cursor during pagination.
 */
["OrderLineItemEdge"]: {
	__typename: "OrderLineItemEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of OrderLineItemEdge. */
	node: GraphQLTypes["OrderLineItem"]
};
	/** The set of valid sort keys for the Order query. */
["OrderSortKeys"]: OrderSortKeys;
	/** Shopify merchants can create pages to hold static HTML content. Each Page object represents a custom page on the online store. */
["Page"]: {
	__typename: "Page",
	/** The description of the page, complete with HTML formatting. */
	body: GraphQLTypes["HTML"],
	/** Summary of the page body. */
	bodySummary: string,
	/** The timestamp of the page creation. */
	createdAt: GraphQLTypes["DateTime"],
	/** A human-friendly unique string for the page automatically generated from its title. */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: GraphQLTypes["URL"] | undefined,
	/** The page's SEO information. */
	seo?: GraphQLTypes["SEO"] | undefined,
	/** The title of the page. */
	title: string,
	/** The timestamp of the latest page update. */
	updatedAt: GraphQLTypes["DateTime"]
};
	/** An auto-generated type for paginating through multiple Pages.
 */
["PageConnection"]: {
	__typename: "PageConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["PageEdge"]>,
	/** A list of the nodes contained in PageEdge. */
	nodes: Array<GraphQLTypes["Page"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one Page and a cursor during pagination.
 */
["PageEdge"]: {
	__typename: "PageEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of PageEdge. */
	node: GraphQLTypes["Page"]
};
	/** Returns information about pagination in a connection, in accordance with the
[Relay specification](https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo).
For more information, please read our [GraphQL Pagination Usage Guide](https://shopify.dev/api/usage/pagination-graphql).
 */
["PageInfo"]: {
	__typename: "PageInfo",
	/** The cursor corresponding to the last node in edges. */
	endCursor?: string | undefined,
	/** Whether there are more pages to fetch following the current page. */
	hasNextPage: boolean,
	/** Whether there are any pages prior to the current page. */
	hasPreviousPage: boolean,
	/** The cursor corresponding to the first node in edges. */
	startCursor?: string | undefined
};
	/** The set of valid sort keys for the Page query. */
["PageSortKeys"]: PageSortKeys;
	/** A payment applied to a checkout. */
["Payment"]: {
	__typename: "Payment",
	/** The amount of the payment. */
	amount: GraphQLTypes["MoneyV2"],
	/** The amount of the payment. */
	amountV2: GraphQLTypes["MoneyV2"],
	/** The billing address for the payment. */
	billingAddress?: GraphQLTypes["MailingAddress"] | undefined,
	/** The checkout to which the payment belongs. */
	checkout: GraphQLTypes["Checkout"],
	/** The credit card used for the payment in the case of direct payments. */
	creditCard?: GraphQLTypes["CreditCard"] | undefined,
	/** A message describing a processing error during asynchronous processing. */
	errorMessage?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** A client-side generated token to identify a payment and perform idempotent operations.
For more information, refer to
[Idempotent requests](https://shopify.dev/api/usage/idempotent-requests).
 */
	idempotencyKey?: string | undefined,
	/** The URL where the customer needs to be redirected so they can complete the 3D Secure payment flow. */
	nextActionUrl?: GraphQLTypes["URL"] | undefined,
	/** Whether the payment is still processing asynchronously. */
	ready: boolean,
	/** A flag to indicate if the payment is to be done in test mode for gateways that support it. */
	test: boolean,
	/** The actual transaction recorded by Shopify after having processed the payment with the gateway. */
	transaction?: GraphQLTypes["Transaction"] | undefined
};
	/** Settings related to payments. */
["PaymentSettings"]: {
	__typename: "PaymentSettings",
	/** List of the card brands which the shop accepts. */
	acceptedCardBrands: Array<GraphQLTypes["CardBrand"]>,
	/** The url pointing to the endpoint to vault credit cards. */
	cardVaultUrl: GraphQLTypes["URL"],
	/** The country where the shop is located. */
	countryCode: GraphQLTypes["CountryCode"],
	/** The three-letter code for the shop's primary currency. */
	currencyCode: GraphQLTypes["CurrencyCode"],
	/** A list of enabled currencies (ISO 4217 format) that the shop accepts. Merchants can enable currencies from their Shopify Payments settings in the Shopify admin. */
	enabledPresentmentCurrencies: Array<GraphQLTypes["CurrencyCode"]>,
	/** The shop’s Shopify Payments account ID. */
	shopifyPaymentsAccountId?: string | undefined,
	/** List of the digital wallets which the shop supports. */
	supportedDigitalWallets: Array<GraphQLTypes["DigitalWallet"]>
};
	/** The valid values for the types of payment token. */
["PaymentTokenType"]: PaymentTokenType;
	/** The input fields for a filter used to view a subset of products in a collection matching a specific price range.
 */
["PriceRangeFilter"]: {
		/** The minimum price in the range. Defaults to zero. */
	min?: number | undefined,
	/** The maximum price in the range. Empty indicates no max price. */
	max?: number | undefined
};
	/** The value of the percentage pricing object. */
["PricingPercentageValue"]: {
	__typename: "PricingPercentageValue",
	/** The percentage value of the object. */
	percentage: number
};
	/** The price value (fixed or percentage) for a discount application. */
["PricingValue"]:{
        	__typename:"MoneyV2" | "PricingPercentageValue"
        	['...on MoneyV2']: '__union' & GraphQLTypes["MoneyV2"];
	['...on PricingPercentageValue']: '__union' & GraphQLTypes["PricingPercentageValue"];
};
	/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
For example, a digital download (such as a movie, music or ebook file) also qualifies as a product, as do services (such as equipment rental, work for hire, customization of another product or an extended warranty). */
["Product"]: {
	__typename: "Product",
	/** Indicates if at least one product variant is available for sale. */
	availableForSale: boolean,
	/** List of collections a product belongs to. */
	collections: GraphQLTypes["CollectionConnection"],
	/** The compare at price of the product across all variants. */
	compareAtPriceRange: GraphQLTypes["ProductPriceRange"],
	/** The date and time when the product was created. */
	createdAt: GraphQLTypes["DateTime"],
	/** Stripped description of the product, single line with HTML tags removed. */
	description: string,
	/** The description of the product, complete with HTML formatting. */
	descriptionHtml: GraphQLTypes["HTML"],
	/** The featured image for the product.

This field is functionally equivalent to `images(first: 1)`.
 */
	featuredImage?: GraphQLTypes["Image"] | undefined,
	/** A human-friendly unique string for the Product automatically generated from its title.
They are used by the Liquid templating language to refer to objects.
 */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** List of images associated with the product. */
	images: GraphQLTypes["ImageConnection"],
	/** Whether the product is a gift card. */
	isGiftCard: boolean,
	/** The media associated with the product. */
	media: GraphQLTypes["MediaConnection"],
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>,
	/** The URL used for viewing the resource on the shop's Online Store. Returns `null` if the resource is currently not published to the Online Store sales channel. */
	onlineStoreUrl?: GraphQLTypes["URL"] | undefined,
	/** List of product options. */
	options: Array<GraphQLTypes["ProductOption"]>,
	/** The price range. */
	priceRange: GraphQLTypes["ProductPriceRange"],
	/** A categorization that a product can be tagged with, commonly used for filtering and searching. */
	productType: string,
	/** The date and time when the product was published to the channel. */
	publishedAt: GraphQLTypes["DateTime"],
	/** Whether the product can only be purchased with a selling plan. */
	requiresSellingPlan: boolean,
	/** A list of a product's available selling plan groups. A selling plan group represents a selling method. For example, 'Subscribe and save' is a selling method where customers pay for goods or services per delivery. A selling plan group contains individual selling plans. */
	sellingPlanGroups: GraphQLTypes["SellingPlanGroupConnection"],
	/** The product's SEO information. */
	seo: GraphQLTypes["SEO"],
	/** A comma separated list of tags that have been added to the product.
Additional access scope required for private apps: unauthenticated_read_product_tags.
 */
	tags: Array<string>,
	/** The product’s title. */
	title: string,
	/** The total quantity of inventory in stock for this Product. */
	totalInventory?: number | undefined,
	/** The date and time when the product was last modified.
A product's `updatedAt` value can change for different reasons. For example, if an order
is placed for a product that has inventory tracking set up, then the inventory adjustment
is counted as an update.
 */
	updatedAt: GraphQLTypes["DateTime"],
	/** Find a product’s variant based on its selected options.
This is useful for converting a user’s selection of product options into a single matching variant.
If there is not a variant for the selected options, `null` will be returned.
 */
	variantBySelectedOptions?: GraphQLTypes["ProductVariant"] | undefined,
	/** List of the product’s variants. */
	variants: GraphQLTypes["ProductVariantConnection"],
	/** The product’s vendor name. */
	vendor: string
};
	/** The set of valid sort keys for the ProductCollection query. */
["ProductCollectionSortKeys"]: ProductCollectionSortKeys;
	/** An auto-generated type for paginating through multiple Products.
 */
["ProductConnection"]: {
	__typename: "ProductConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["ProductEdge"]>,
	/** A list of available filters. */
	filters: Array<GraphQLTypes["Filter"]>,
	/** A list of the nodes contained in ProductEdge. */
	nodes: Array<GraphQLTypes["Product"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one Product and a cursor during pagination.
 */
["ProductEdge"]: {
	__typename: "ProductEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of ProductEdge. */
	node: GraphQLTypes["Product"]
};
	/** The input fields for a filter used to view a subset of products in a collection. */
["ProductFilter"]: {
		/** Filter on if the product is available for sale. */
	available?: boolean | undefined,
	/** A variant option to filter on. */
	variantOption?: GraphQLTypes["VariantOptionFilter"] | undefined,
	/** The product type to filter on. */
	productType?: string | undefined,
	/** The product vendor to filter on. */
	productVendor?: string | undefined,
	/** A range of prices to filter with-in. */
	price?: GraphQLTypes["PriceRangeFilter"] | undefined,
	/** A product metafield to filter on. */
	productMetafield?: GraphQLTypes["MetafieldFilter"] | undefined,
	/** A variant metafield to filter on. */
	variantMetafield?: GraphQLTypes["MetafieldFilter"] | undefined,
	/** A product tag to filter on. */
	tag?: string | undefined
};
	/** The set of valid sort keys for the ProductImage query. */
["ProductImageSortKeys"]: ProductImageSortKeys;
	/** The set of valid sort keys for the ProductMedia query. */
["ProductMediaSortKeys"]: ProductMediaSortKeys;
	/** Product property names like "Size", "Color", and "Material" that the customers can select.
Variants are selected based on permutations of these options.
255 characters limit each.
 */
["ProductOption"]: {
	__typename: "ProductOption",
	/** A globally-unique ID. */
	id: string,
	/** The product option’s name. */
	name: string,
	/** The corresponding value to the product option name. */
	values: Array<string>
};
	/** The price range of the product. */
["ProductPriceRange"]: {
	__typename: "ProductPriceRange",
	/** The highest variant's price. */
	maxVariantPrice: GraphQLTypes["MoneyV2"],
	/** The lowest variant's price. */
	minVariantPrice: GraphQLTypes["MoneyV2"]
};
	/** The set of valid sort keys for the Product query. */
["ProductSortKeys"]: ProductSortKeys;
	/** A product variant represents a different version of a product, such as differing sizes or differing colors. */
["ProductVariant"]: {
	__typename: "ProductVariant",
	/** Indicates if the product variant is available for sale. */
	availableForSale: boolean,
	/** The barcode (for example, ISBN, UPC, or GTIN) associated with the variant. */
	barcode?: string | undefined,
	/** The compare at price of the variant. This can be used to mark a variant as on sale, when `compareAtPrice` is higher than `price`. */
	compareAtPrice?: GraphQLTypes["MoneyV2"] | undefined,
	/** The compare at price of the variant. This can be used to mark a variant as on sale, when `compareAtPriceV2` is higher than `priceV2`. */
	compareAtPriceV2?: GraphQLTypes["MoneyV2"] | undefined,
	/** Whether a product is out of stock but still available for purchase (used for backorders). */
	currentlyNotInStock: boolean,
	/** A globally-unique ID. */
	id: string,
	/** Image associated with the product variant. This field falls back to the product image if no image is available.
 */
	image?: GraphQLTypes["Image"] | undefined,
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>,
	/** The product variant’s price. */
	price: GraphQLTypes["MoneyV2"],
	/** The product variant’s price. */
	priceV2: GraphQLTypes["MoneyV2"],
	/** The product object that the product variant belongs to. */
	product: GraphQLTypes["Product"],
	/** The total sellable quantity of the variant for online sales channels. */
	quantityAvailable?: number | undefined,
	/** Whether a customer needs to provide a shipping address when placing an order for the product variant. */
	requiresShipping: boolean,
	/** List of product options applied to the variant. */
	selectedOptions: Array<GraphQLTypes["SelectedOption"]>,
	/** Represents an association between a variant and a selling plan. Selling plan allocations describe which selling plans are available for each variant, and what their impact is on pricing. */
	sellingPlanAllocations: GraphQLTypes["SellingPlanAllocationConnection"],
	/** The SKU (stock keeping unit) associated with the variant. */
	sku?: string | undefined,
	/** The in-store pickup availability of this variant by location. */
	storeAvailability: GraphQLTypes["StoreAvailabilityConnection"],
	/** The product variant’s title. */
	title: string,
	/** The unit price value for the variant based on the variant's measurement. */
	unitPrice?: GraphQLTypes["MoneyV2"] | undefined,
	/** The unit price measurement for the variant. */
	unitPriceMeasurement?: GraphQLTypes["UnitPriceMeasurement"] | undefined,
	/** The weight of the product variant in the unit system specified with `weight_unit`. */
	weight?: number | undefined,
	/** Unit of measurement for weight. */
	weightUnit: GraphQLTypes["WeightUnit"]
};
	/** An auto-generated type for paginating through multiple ProductVariants.
 */
["ProductVariantConnection"]: {
	__typename: "ProductVariantConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["ProductVariantEdge"]>,
	/** A list of the nodes contained in ProductVariantEdge. */
	nodes: Array<GraphQLTypes["ProductVariant"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one ProductVariant and a cursor during pagination.
 */
["ProductVariantEdge"]: {
	__typename: "ProductVariantEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of ProductVariantEdge. */
	node: GraphQLTypes["ProductVariant"]
};
	/** The set of valid sort keys for the ProductVariant query. */
["ProductVariantSortKeys"]: ProductVariantSortKeys;
	/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
["QueryRoot"]: {
	__typename: "QueryRoot",
	/** List of the shop's articles. */
	articles: GraphQLTypes["ArticleConnection"],
	/** Fetch a specific `Blog` by one of its unique attributes. */
	blog?: GraphQLTypes["Blog"] | undefined,
	/** Find a blog by its handle. */
	blogByHandle?: GraphQLTypes["Blog"] | undefined,
	/** List of the shop's blogs. */
	blogs: GraphQLTypes["BlogConnection"],
	/** Retrieve a cart by its ID. For more information, refer to
[Manage a cart with the Storefront API](https://shopify.dev/custom-storefronts/cart/manage).
 */
	cart?: GraphQLTypes["Cart"] | undefined,
	/** Fetch a specific `Collection` by one of its unique attributes. */
	collection?: GraphQLTypes["Collection"] | undefined,
	/** Find a collection by its handle. */
	collectionByHandle?: GraphQLTypes["Collection"] | undefined,
	/** List of the shop’s collections. */
	collections: GraphQLTypes["CollectionConnection"],
	/** The customer associated with the given access token. Tokens are obtained by using the
[`customerAccessTokenCreate` mutation](https://shopify.dev/docs/api/storefront/latest/mutations/customerAccessTokenCreate).
 */
	customer?: GraphQLTypes["Customer"] | undefined,
	/** Returns the localized experiences configured for the shop. */
	localization: GraphQLTypes["Localization"],
	/** List of the shop's locations that support in-store pickup.

When sorting by distance, you must specify a location via the `near` argument.
 */
	locations: GraphQLTypes["LocationConnection"],
	/** Retrieve a [navigation menu](https://help.shopify.com/manual/online-store/menus-and-links) by its handle.
 */
	menu?: GraphQLTypes["Menu"] | undefined,
	/** Fetch a specific Metaobject by one of its unique identifiers. */
	metaobject?: GraphQLTypes["Metaobject"] | undefined,
	/** All active metaobjects for the shop. */
	metaobjects: GraphQLTypes["MetaobjectConnection"],
	/** Returns a specific node by ID. */
	node?: GraphQLTypes["Node"] | undefined,
	/** Returns the list of nodes with the given IDs. */
	nodes: Array<GraphQLTypes["Node"] | undefined>,
	/** Fetch a specific `Page` by one of its unique attributes. */
	page?: GraphQLTypes["Page"] | undefined,
	/** Find a page by its handle. */
	pageByHandle?: GraphQLTypes["Page"] | undefined,
	/** List of the shop's pages. */
	pages: GraphQLTypes["PageConnection"],
	/** Fetch a specific `Product` by one of its unique attributes. */
	product?: GraphQLTypes["Product"] | undefined,
	/** Find a product by its handle. */
	productByHandle?: GraphQLTypes["Product"] | undefined,
	/** Find recommended products related to a given `product_id`.
To learn more about how recommendations are generated, see
[*Showing product recommendations on product pages*](https://help.shopify.com/themes/development/recommended-products).
 */
	productRecommendations?: Array<GraphQLTypes["Product"]> | undefined,
	/** Tags added to products.
Additional access scope required: unauthenticated_read_product_tags.
 */
	productTags: GraphQLTypes["StringConnection"],
	/** List of product types for the shop's products that are published to your app. */
	productTypes: GraphQLTypes["StringConnection"],
	/** List of the shop’s products. */
	products: GraphQLTypes["ProductConnection"],
	/** The list of public Storefront API versions, including supported, release candidate and unstable versions. */
	publicApiVersions: Array<GraphQLTypes["ApiVersion"]>,
	/** The shop associated with the storefront access token. */
	shop: GraphQLTypes["Shop"],
	/** A list of redirects for a shop. */
	urlRedirects: GraphQLTypes["UrlRedirectConnection"]
};
	/** SEO information. */
["SEO"]: {
	__typename: "SEO",
	/** The meta description. */
	description?: string | undefined,
	/** The SEO title. */
	title?: string | undefined
};
	/** Script discount applications capture the intentions of a discount that
was created by a Shopify Script.
 */
["ScriptDiscountApplication"]: {
	__typename: "ScriptDiscountApplication",
	/** The method by which the discount's value is allocated to its entitled items. */
	allocationMethod: GraphQLTypes["DiscountApplicationAllocationMethod"],
	/** Which lines of targetType that the discount is allocated over. */
	targetSelection: GraphQLTypes["DiscountApplicationTargetSelection"],
	/** The type of line that the discount is applicable towards. */
	targetType: GraphQLTypes["DiscountApplicationTargetType"],
	/** The title of the application as defined by the Script. */
	title: string,
	/** The value of the discount application. */
	value: GraphQLTypes["PricingValue"]
};
	/** Properties used by customers to select a product variant.
Products can have multiple options, like different sizes or colors.
 */
["SelectedOption"]: {
	__typename: "SelectedOption",
	/** The product option’s name. */
	name: string,
	/** The product option’s value. */
	value: string
};
	/** The input fields required for a selected option. */
["SelectedOptionInput"]: {
		/** The product option’s name. */
	name: string,
	/** The product option’s value. */
	value: string
};
	/** Represents how products and variants can be sold and purchased. */
["SellingPlan"]: {
	__typename: "SellingPlan",
	/** The initial payment due for the purchase. */
	checkoutCharge: GraphQLTypes["SellingPlanCheckoutCharge"],
	/** The description of the selling plan. */
	description?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'. */
	name: string,
	/** The selling plan options available in the drop-down list in the storefront. For example, 'Delivery every week' or 'Delivery every 2 weeks' specifies the delivery frequency options for the product. Individual selling plans contribute their options to the associated selling plan group. For example, a selling plan group might have an option called `option1: Delivery every`. One selling plan in that group could contribute `option1: 2 weeks` with the pricing for that option, and another selling plan could contribute `option1: 4 weeks`, with different pricing. */
	options: Array<GraphQLTypes["SellingPlanOption"]>,
	/** The price adjustments that a selling plan makes when a variant is purchased with a selling plan. */
	priceAdjustments: Array<GraphQLTypes["SellingPlanPriceAdjustment"]>,
	/** Whether purchasing the selling plan will result in multiple deliveries. */
	recurringDeliveries: boolean
};
	/** Represents an association between a variant and a selling plan. Selling plan allocations describe the options offered for each variant, and the price of the variant when purchased with a selling plan. */
["SellingPlanAllocation"]: {
	__typename: "SellingPlanAllocation",
	/** The checkout charge amount due for the purchase. */
	checkoutChargeAmount: GraphQLTypes["MoneyV2"],
	/** A list of price adjustments, with a maximum of two. When there are two, the first price adjustment goes into effect at the time of purchase, while the second one starts after a certain number of orders. A price adjustment represents how a selling plan affects pricing when a variant is purchased with a selling plan. Prices display in the customer's currency if the shop is configured for it. */
	priceAdjustments: Array<GraphQLTypes["SellingPlanAllocationPriceAdjustment"]>,
	/** The remaining balance charge amount due for the purchase. */
	remainingBalanceChargeAmount: GraphQLTypes["MoneyV2"],
	/** A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'. */
	sellingPlan: GraphQLTypes["SellingPlan"]
};
	/** An auto-generated type for paginating through multiple SellingPlanAllocations.
 */
["SellingPlanAllocationConnection"]: {
	__typename: "SellingPlanAllocationConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["SellingPlanAllocationEdge"]>,
	/** A list of the nodes contained in SellingPlanAllocationEdge. */
	nodes: Array<GraphQLTypes["SellingPlanAllocation"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one SellingPlanAllocation and a cursor during pagination.
 */
["SellingPlanAllocationEdge"]: {
	__typename: "SellingPlanAllocationEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of SellingPlanAllocationEdge. */
	node: GraphQLTypes["SellingPlanAllocation"]
};
	/** The resulting prices for variants when they're purchased with a specific selling plan. */
["SellingPlanAllocationPriceAdjustment"]: {
	__typename: "SellingPlanAllocationPriceAdjustment",
	/** The price of the variant when it's purchased without a selling plan for the same number of deliveries. For example, if a customer purchases 6 deliveries of $10.00 granola separately, then the price is 6 x $10.00 = $60.00. */
	compareAtPrice: GraphQLTypes["MoneyV2"],
	/** The effective price for a single delivery. For example, for a prepaid subscription plan that includes 6 deliveries at the price of $48.00, the per delivery price is $8.00. */
	perDeliveryPrice: GraphQLTypes["MoneyV2"],
	/** The price of the variant when it's purchased with a selling plan For example, for a prepaid subscription plan that includes 6 deliveries of $10.00 granola, where the customer gets 20% off, the price is 6 x $10.00 x 0.80 = $48.00. */
	price: GraphQLTypes["MoneyV2"],
	/** The resulting price per unit for the variant associated with the selling plan. If the variant isn't sold by quantity or measurement, then this field returns `null`. */
	unitPrice?: GraphQLTypes["MoneyV2"] | undefined
};
	/** The initial payment due for the purchase. */
["SellingPlanCheckoutCharge"]: {
	__typename: "SellingPlanCheckoutCharge",
	/** The charge type for the checkout charge. */
	type: GraphQLTypes["SellingPlanCheckoutChargeType"],
	/** The charge value for the checkout charge. */
	value: GraphQLTypes["SellingPlanCheckoutChargeValue"]
};
	/** The percentage value of the price used for checkout charge. */
["SellingPlanCheckoutChargePercentageValue"]: {
	__typename: "SellingPlanCheckoutChargePercentageValue",
	/** The percentage value of the price used for checkout charge. */
	percentage: number
};
	/** The checkout charge when the full amount isn't charged at checkout. */
["SellingPlanCheckoutChargeType"]: SellingPlanCheckoutChargeType;
	/** The portion of the price to be charged at checkout. */
["SellingPlanCheckoutChargeValue"]:{
        	__typename:"MoneyV2" | "SellingPlanCheckoutChargePercentageValue"
        	['...on MoneyV2']: '__union' & GraphQLTypes["MoneyV2"];
	['...on SellingPlanCheckoutChargePercentageValue']: '__union' & GraphQLTypes["SellingPlanCheckoutChargePercentageValue"];
};
	/** An auto-generated type for paginating through multiple SellingPlans.
 */
["SellingPlanConnection"]: {
	__typename: "SellingPlanConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["SellingPlanEdge"]>,
	/** A list of the nodes contained in SellingPlanEdge. */
	nodes: Array<GraphQLTypes["SellingPlan"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one SellingPlan and a cursor during pagination.
 */
["SellingPlanEdge"]: {
	__typename: "SellingPlanEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of SellingPlanEdge. */
	node: GraphQLTypes["SellingPlan"]
};
	/** A fixed amount that's deducted from the original variant price. For example, $10.00 off. */
["SellingPlanFixedAmountPriceAdjustment"]: {
	__typename: "SellingPlanFixedAmountPriceAdjustment",
	/** The money value of the price adjustment. */
	adjustmentAmount: GraphQLTypes["MoneyV2"]
};
	/** A fixed price adjustment for a variant that's purchased with a selling plan. */
["SellingPlanFixedPriceAdjustment"]: {
	__typename: "SellingPlanFixedPriceAdjustment",
	/** A new price of the variant when it's purchased with the selling plan. */
	price: GraphQLTypes["MoneyV2"]
};
	/** Represents a selling method. For example, 'Subscribe and save' is a selling method where customers pay for goods or services per delivery. A selling plan group contains individual selling plans. */
["SellingPlanGroup"]: {
	__typename: "SellingPlanGroup",
	/** A display friendly name for the app that created the selling plan group. */
	appName?: string | undefined,
	/** The name of the selling plan group. */
	name: string,
	/** Represents the selling plan options available in the drop-down list in the storefront. For example, 'Delivery every week' or 'Delivery every 2 weeks' specifies the delivery frequency options for the product. */
	options: Array<GraphQLTypes["SellingPlanGroupOption"]>,
	/** A list of selling plans in a selling plan group. A selling plan is a representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'. */
	sellingPlans: GraphQLTypes["SellingPlanConnection"]
};
	/** An auto-generated type for paginating through multiple SellingPlanGroups.
 */
["SellingPlanGroupConnection"]: {
	__typename: "SellingPlanGroupConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["SellingPlanGroupEdge"]>,
	/** A list of the nodes contained in SellingPlanGroupEdge. */
	nodes: Array<GraphQLTypes["SellingPlanGroup"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one SellingPlanGroup and a cursor during pagination.
 */
["SellingPlanGroupEdge"]: {
	__typename: "SellingPlanGroupEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of SellingPlanGroupEdge. */
	node: GraphQLTypes["SellingPlanGroup"]
};
	/** Represents an option on a selling plan group that's available in the drop-down list in the storefront.

Individual selling plans contribute their options to the associated selling plan group. For example, a selling plan group might have an option called `option1: Delivery every`. One selling plan in that group could contribute `option1: 2 weeks` with the pricing for that option, and another selling plan could contribute `option1: 4 weeks`, with different pricing. */
["SellingPlanGroupOption"]: {
	__typename: "SellingPlanGroupOption",
	/** The name of the option. For example, 'Delivery every'. */
	name: string,
	/** The values for the options specified by the selling plans in the selling plan group. For example, '1 week', '2 weeks', '3 weeks'. */
	values: Array<string>
};
	/** An option provided by a Selling Plan. */
["SellingPlanOption"]: {
	__typename: "SellingPlanOption",
	/** The name of the option (ie "Delivery every"). */
	name?: string | undefined,
	/** The value of the option (ie "Month"). */
	value?: string | undefined
};
	/** A percentage amount that's deducted from the original variant price. For example, 10% off. */
["SellingPlanPercentagePriceAdjustment"]: {
	__typename: "SellingPlanPercentagePriceAdjustment",
	/** The percentage value of the price adjustment. */
	adjustmentPercentage: number
};
	/** Represents by how much the price of a variant associated with a selling plan is adjusted. Each variant can have up to two price adjustments. If a variant has multiple price adjustments, then the first price adjustment applies when the variant is initially purchased. The second price adjustment applies after a certain number of orders (specified by the `orderCount` field) are made. If a selling plan doesn't have any price adjustments, then the unadjusted price of the variant is the effective price. */
["SellingPlanPriceAdjustment"]: {
	__typename: "SellingPlanPriceAdjustment",
	/** The type of price adjustment. An adjustment value can have one of three types: percentage, amount off, or a new price. */
	adjustmentValue: GraphQLTypes["SellingPlanPriceAdjustmentValue"],
	/** The number of orders that the price adjustment applies to. If the price adjustment always applies, then this field is `null`. */
	orderCount?: number | undefined
};
	/** Represents by how much the price of a variant associated with a selling plan is adjusted. Each variant can have up to two price adjustments. */
["SellingPlanPriceAdjustmentValue"]:{
        	__typename:"SellingPlanFixedAmountPriceAdjustment" | "SellingPlanFixedPriceAdjustment" | "SellingPlanPercentagePriceAdjustment"
        	['...on SellingPlanFixedAmountPriceAdjustment']: '__union' & GraphQLTypes["SellingPlanFixedAmountPriceAdjustment"];
	['...on SellingPlanFixedPriceAdjustment']: '__union' & GraphQLTypes["SellingPlanFixedPriceAdjustment"];
	['...on SellingPlanPercentagePriceAdjustment']: '__union' & GraphQLTypes["SellingPlanPercentagePriceAdjustment"];
};
	/** A shipping rate to be applied to a checkout. */
["ShippingRate"]: {
	__typename: "ShippingRate",
	/** Human-readable unique identifier for this shipping rate. */
	handle: string,
	/** Price of this shipping rate. */
	price: GraphQLTypes["MoneyV2"],
	/** Price of this shipping rate. */
	priceV2: GraphQLTypes["MoneyV2"],
	/** Title of this shipping rate. */
	title: string
};
	/** Shop represents a collection of the general settings and information about the shop. */
["Shop"]: {
	__typename: "Shop",
	/** The shop's branding configuration. */
	brand?: GraphQLTypes["Brand"] | undefined,
	/** A description of the shop. */
	description?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** Returns a metafield found by namespace and key. */
	metafield?: GraphQLTypes["Metafield"] | undefined,
	/** The metafields associated with the resource matching the supplied list of namespaces and keys.
 */
	metafields: Array<GraphQLTypes["Metafield"] | undefined>,
	/** A string representing the way currency is formatted when the currency isn’t specified. */
	moneyFormat: string,
	/** The shop’s name. */
	name: string,
	/** Settings related to payments. */
	paymentSettings: GraphQLTypes["PaymentSettings"],
	/** The primary domain of the shop’s Online Store. */
	primaryDomain: GraphQLTypes["Domain"],
	/** The shop’s privacy policy. */
	privacyPolicy?: GraphQLTypes["ShopPolicy"] | undefined,
	/** The shop’s refund policy. */
	refundPolicy?: GraphQLTypes["ShopPolicy"] | undefined,
	/** The shop’s shipping policy. */
	shippingPolicy?: GraphQLTypes["ShopPolicy"] | undefined,
	/** Countries that the shop ships to. */
	shipsToCountries: Array<GraphQLTypes["CountryCode"]>,
	/** The shop’s subscription policy. */
	subscriptionPolicy?: GraphQLTypes["ShopPolicyWithDefault"] | undefined,
	/** The shop’s terms of service. */
	termsOfService?: GraphQLTypes["ShopPolicy"] | undefined
};
	/** Policy that a merchant has configured for their store, such as their refund or privacy policy. */
["ShopPolicy"]: {
	__typename: "ShopPolicy",
	/** Policy text, maximum size of 64kb. */
	body: string,
	/** Policy’s handle. */
	handle: string,
	/** A globally-unique ID. */
	id: string,
	/** Policy’s title. */
	title: string,
	/** Public URL to the policy. */
	url: GraphQLTypes["URL"]
};
	/** A policy for the store that comes with a default value, such as a subscription policy.
If the merchant hasn't configured a policy for their store, then the policy will return the default value.
Otherwise, the policy will return the merchant-configured value.
 */
["ShopPolicyWithDefault"]: {
	__typename: "ShopPolicyWithDefault",
	/** The text of the policy. Maximum size: 64KB. */
	body: string,
	/** The handle of the policy. */
	handle: string,
	/** The unique ID of the policy. A default policy doesn't have an ID. */
	id?: string | undefined,
	/** The title of the policy. */
	title: string,
	/** Public URL to the policy. */
	url: GraphQLTypes["URL"]
};
	/** The availability of a product variant at a particular location.
Local pick-up must be enabled in the  store's shipping settings, otherwise this will return an empty result.
 */
["StoreAvailability"]: {
	__typename: "StoreAvailability",
	/** Whether the product variant is in-stock at this location. */
	available: boolean,
	/** The location where this product variant is stocked at. */
	location: GraphQLTypes["Location"],
	/** Returns the estimated amount of time it takes for pickup to be ready (Example: Usually ready in 24 hours). */
	pickUpTime: string
};
	/** An auto-generated type for paginating through multiple StoreAvailabilities.
 */
["StoreAvailabilityConnection"]: {
	__typename: "StoreAvailabilityConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["StoreAvailabilityEdge"]>,
	/** A list of the nodes contained in StoreAvailabilityEdge. */
	nodes: Array<GraphQLTypes["StoreAvailability"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one StoreAvailability and a cursor during pagination.
 */
["StoreAvailabilityEdge"]: {
	__typename: "StoreAvailabilityEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of StoreAvailabilityEdge. */
	node: GraphQLTypes["StoreAvailability"]
};
	/** An auto-generated type for paginating through a list of Strings.
 */
["StringConnection"]: {
	__typename: "StringConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["StringEdge"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one String and a cursor during pagination.
 */
["StringEdge"]: {
	__typename: "StringEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of StringEdge. */
	node: string
};
	/** Specifies the fields required to complete a checkout with
a tokenized payment.
 */
["TokenizedPaymentInputV3"]: {
		/** The amount and currency of the payment. */
	paymentAmount: GraphQLTypes["MoneyInput"],
	/** A unique client generated key used to avoid duplicate charges. When a duplicate payment is found, the original is returned instead of creating a new one. For more information, refer to [Idempotent requests](https://shopify.dev/api/usage/idempotent-requests). */
	idempotencyKey: string,
	/** The billing address for the payment. */
	billingAddress: GraphQLTypes["MailingAddressInput"],
	/** A simple string or JSON containing the required payment data for the tokenized payment. */
	paymentData: string,
	/** Whether to execute the payment in test mode, if possible. Test mode is not supported in production stores. Defaults to `false`. */
	test?: boolean | undefined,
	/** Public Hash Key used for AndroidPay payments only. */
	identifier?: string | undefined,
	/** The type of payment token. */
	type: GraphQLTypes["PaymentTokenType"]
};
	/** An object representing exchange of money for a product or service. */
["Transaction"]: {
	__typename: "Transaction",
	/** The amount of money that the transaction was for. */
	amount: GraphQLTypes["MoneyV2"],
	/** The amount of money that the transaction was for. */
	amountV2: GraphQLTypes["MoneyV2"],
	/** The kind of the transaction. */
	kind: GraphQLTypes["TransactionKind"],
	/** The status of the transaction. */
	status: GraphQLTypes["TransactionStatus"],
	/** The status of the transaction. */
	statusV2?: GraphQLTypes["TransactionStatus"] | undefined,
	/** Whether the transaction was done in test mode or not. */
	test: boolean
};
	/** The different kinds of order transactions. */
["TransactionKind"]: TransactionKind;
	/** Transaction statuses describe the status of a transaction. */
["TransactionStatus"]: TransactionStatus;
	/** Represents an [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986) and
[RFC 3987](https://datatracker.ietf.org/doc/html/rfc3987)-compliant URI string.

For example, `"https://johns-apparel.myshopify.com"` is a valid URL. It includes a scheme (`https`) and a host
(`johns-apparel.myshopify.com`).
 */
["URL"]: "scalar" & { name: "URL" };
	/** The measurement used to calculate a unit price for a product variant (e.g. $9.99 / 100ml).
 */
["UnitPriceMeasurement"]: {
	__typename: "UnitPriceMeasurement",
	/** The type of unit of measurement for the unit price measurement. */
	measuredType?: GraphQLTypes["UnitPriceMeasurementMeasuredType"] | undefined,
	/** The quantity unit for the unit price measurement. */
	quantityUnit?: GraphQLTypes["UnitPriceMeasurementMeasuredUnit"] | undefined,
	/** The quantity value for the unit price measurement. */
	quantityValue: number,
	/** The reference unit for the unit price measurement. */
	referenceUnit?: GraphQLTypes["UnitPriceMeasurementMeasuredUnit"] | undefined,
	/** The reference value for the unit price measurement. */
	referenceValue: number
};
	/** The accepted types of unit of measurement. */
["UnitPriceMeasurementMeasuredType"]: UnitPriceMeasurementMeasuredType;
	/** The valid units of measurement for a unit price measurement. */
["UnitPriceMeasurementMeasuredUnit"]: UnitPriceMeasurementMeasuredUnit;
	/** Systems of weights and measures. */
["UnitSystem"]: UnitSystem;
	/** An unsigned 64-bit integer. Represents whole numeric values between 0 and 2^64 - 1 encoded as a string of base-10 digits.

Example value: `"50"`.
 */
["UnsignedInt64"]: "scalar" & { name: "UnsignedInt64" };
	/** A redirect on the online store. */
["UrlRedirect"]: {
	__typename: "UrlRedirect",
	/** The ID of the URL redirect. */
	id: string,
	/** The old path to be redirected from. When the user visits this path, they'll be redirected to the target location. */
	path: string,
	/** The target location where the user will be redirected to. */
	target: string
};
	/** An auto-generated type for paginating through multiple UrlRedirects.
 */
["UrlRedirectConnection"]: {
	__typename: "UrlRedirectConnection",
	/** A list of edges. */
	edges: Array<GraphQLTypes["UrlRedirectEdge"]>,
	/** A list of the nodes contained in UrlRedirectEdge. */
	nodes: Array<GraphQLTypes["UrlRedirect"]>,
	/** Information to aid in pagination. */
	pageInfo: GraphQLTypes["PageInfo"]
};
	/** An auto-generated type which holds one UrlRedirect and a cursor during pagination.
 */
["UrlRedirectEdge"]: {
	__typename: "UrlRedirectEdge",
	/** A cursor for use in pagination. */
	cursor: string,
	/** The item at the end of UrlRedirectEdge. */
	node: GraphQLTypes["UrlRedirect"]
};
	/** Represents an error in the input of a mutation. */
["UserError"]: {
	__typename: "UserError",
	/** The path to the input field that caused the error. */
	field?: Array<string> | undefined,
	/** The error message. */
	message: string
};
	/** The input fields for a filter used to view a subset of products in a collection matching a specific variant option.
 */
["VariantOptionFilter"]: {
		/** The name of the variant option to filter on. */
	name: string,
	/** The value of the variant option to filter on. */
	value: string
};
	/** Represents a Shopify hosted video. */
["Video"]: {
	__typename: "Video",
	/** A word or phrase to share the nature or contents of a media. */
	alt?: string | undefined,
	/** A globally-unique ID. */
	id: string,
	/** The media content type. */
	mediaContentType: GraphQLTypes["MediaContentType"],
	/** The preview image for the media. */
	previewImage?: GraphQLTypes["Image"] | undefined,
	/** The sources for a video. */
	sources: Array<GraphQLTypes["VideoSource"]>
};
	/** Represents a source for a Shopify hosted video. */
["VideoSource"]: {
	__typename: "VideoSource",
	/** The format of the video source. */
	format: string,
	/** The height of the video. */
	height: number,
	/** The video MIME type. */
	mimeType: string,
	/** The URL of the video. */
	url: string,
	/** The width of the video. */
	width: number
};
	/** Units of measurement for weight. */
["WeightUnit"]: WeightUnit
    }
/** The set of valid sort keys for the Article query. */
export const enum ArticleSortKeys {
	TITLE = "TITLE",
	BLOG_TITLE = "BLOG_TITLE",
	AUTHOR = "AUTHOR",
	UPDATED_AT = "UPDATED_AT",
	PUBLISHED_AT = "PUBLISHED_AT",
	ID = "ID",
	RELEVANCE = "RELEVANCE"
}
/** The set of valid sort keys for the Blog query. */
export const enum BlogSortKeys {
	HANDLE = "HANDLE",
	TITLE = "TITLE",
	ID = "ID",
	RELEVANCE = "RELEVANCE"
}
/** Card brand, such as Visa or Mastercard, which can be used for payments. */
export const enum CardBrand {
	VISA = "VISA",
	MASTERCARD = "MASTERCARD",
	DISCOVER = "DISCOVER",
	AMERICAN_EXPRESS = "AMERICAN_EXPRESS",
	DINERS_CLUB = "DINERS_CLUB",
	JCB = "JCB"
}
/** Possible error codes that can be returned by `CartUserError`. */
export const enum CartErrorCode {
	INVALID = "INVALID",
	LESS_THAN = "LESS_THAN",
	INVALID_MERCHANDISE_LINE = "INVALID_MERCHANDISE_LINE",
	MISSING_DISCOUNT_CODE = "MISSING_DISCOUNT_CODE",
	MISSING_NOTE = "MISSING_NOTE"
}
/** Possible error codes that can be returned by `CheckoutUserError`. */
export const enum CheckoutErrorCode {
	BLANK = "BLANK",
	INVALID = "INVALID",
	TOO_LONG = "TOO_LONG",
	PRESENT = "PRESENT",
	LESS_THAN = "LESS_THAN",
	GREATER_THAN_OR_EQUAL_TO = "GREATER_THAN_OR_EQUAL_TO",
	LESS_THAN_OR_EQUAL_TO = "LESS_THAN_OR_EQUAL_TO",
	ALREADY_COMPLETED = "ALREADY_COMPLETED",
	LOCKED = "LOCKED",
	NOT_SUPPORTED = "NOT_SUPPORTED",
	BAD_DOMAIN = "BAD_DOMAIN",
	INVALID_FOR_COUNTRY = "INVALID_FOR_COUNTRY",
	INVALID_FOR_COUNTRY_AND_PROVINCE = "INVALID_FOR_COUNTRY_AND_PROVINCE",
	INVALID_STATE_IN_COUNTRY = "INVALID_STATE_IN_COUNTRY",
	INVALID_PROVINCE_IN_COUNTRY = "INVALID_PROVINCE_IN_COUNTRY",
	INVALID_REGION_IN_COUNTRY = "INVALID_REGION_IN_COUNTRY",
	SHIPPING_RATE_EXPIRED = "SHIPPING_RATE_EXPIRED",
	GIFT_CARD_UNUSABLE = "GIFT_CARD_UNUSABLE",
	GIFT_CARD_DISABLED = "GIFT_CARD_DISABLED",
	GIFT_CARD_CODE_INVALID = "GIFT_CARD_CODE_INVALID",
	GIFT_CARD_ALREADY_APPLIED = "GIFT_CARD_ALREADY_APPLIED",
	GIFT_CARD_CURRENCY_MISMATCH = "GIFT_CARD_CURRENCY_MISMATCH",
	GIFT_CARD_EXPIRED = "GIFT_CARD_EXPIRED",
	GIFT_CARD_DEPLETED = "GIFT_CARD_DEPLETED",
	GIFT_CARD_NOT_FOUND = "GIFT_CARD_NOT_FOUND",
	CART_DOES_NOT_MEET_DISCOUNT_REQUIREMENTS_NOTICE = "CART_DOES_NOT_MEET_DISCOUNT_REQUIREMENTS_NOTICE",
	DISCOUNT_EXPIRED = "DISCOUNT_EXPIRED",
	DISCOUNT_DISABLED = "DISCOUNT_DISABLED",
	DISCOUNT_LIMIT_REACHED = "DISCOUNT_LIMIT_REACHED",
	HIGHER_VALUE_DISCOUNT_APPLIED = "HIGHER_VALUE_DISCOUNT_APPLIED",
	MAXIMUM_DISCOUNT_CODE_LIMIT_REACHED = "MAXIMUM_DISCOUNT_CODE_LIMIT_REACHED",
	DISCOUNT_NOT_FOUND = "DISCOUNT_NOT_FOUND",
	CUSTOMER_ALREADY_USED_ONCE_PER_CUSTOMER_DISCOUNT_NOTICE = "CUSTOMER_ALREADY_USED_ONCE_PER_CUSTOMER_DISCOUNT_NOTICE",
	DISCOUNT_CODE_APPLICATION_FAILED = "DISCOUNT_CODE_APPLICATION_FAILED",
	EMPTY = "EMPTY",
	NOT_ENOUGH_IN_STOCK = "NOT_ENOUGH_IN_STOCK",
	MISSING_PAYMENT_INPUT = "MISSING_PAYMENT_INPUT",
	TOTAL_PRICE_MISMATCH = "TOTAL_PRICE_MISMATCH",
	LINE_ITEM_NOT_FOUND = "LINE_ITEM_NOT_FOUND",
	UNABLE_TO_APPLY = "UNABLE_TO_APPLY",
	DISCOUNT_ALREADY_APPLIED = "DISCOUNT_ALREADY_APPLIED",
	THROTTLED_DURING_CHECKOUT = "THROTTLED_DURING_CHECKOUT",
	EXPIRED_QUEUE_TOKEN = "EXPIRED_QUEUE_TOKEN",
	INVALID_QUEUE_TOKEN = "INVALID_QUEUE_TOKEN",
	INVALID_COUNTRY_AND_CURRENCY = "INVALID_COUNTRY_AND_CURRENCY"
}
/** The set of valid sort keys for the Collection query. */
export const enum CollectionSortKeys {
	TITLE = "TITLE",
	UPDATED_AT = "UPDATED_AT",
	ID = "ID",
	RELEVANCE = "RELEVANCE"
}
/** The code designating a country/region, which generally follows ISO 3166-1 alpha-2 guidelines.
If a territory doesn't have a country code value in the `CountryCode` enum, then it might be considered a subdivision
of another country. For example, the territories associated with Spain are represented by the country code `ES`,
and the territories associated with the United States of America are represented by the country code `US`.
 */
export const enum CountryCode {
	AF = "AF",
	AX = "AX",
	AL = "AL",
	DZ = "DZ",
	AD = "AD",
	AO = "AO",
	AI = "AI",
	AG = "AG",
	AR = "AR",
	AM = "AM",
	AW = "AW",
	AC = "AC",
	AU = "AU",
	AT = "AT",
	AZ = "AZ",
	BS = "BS",
	BH = "BH",
	BD = "BD",
	BB = "BB",
	BY = "BY",
	BE = "BE",
	BZ = "BZ",
	BJ = "BJ",
	BM = "BM",
	BT = "BT",
	BO = "BO",
	BA = "BA",
	BW = "BW",
	BV = "BV",
	BR = "BR",
	IO = "IO",
	BN = "BN",
	BG = "BG",
	BF = "BF",
	BI = "BI",
	KH = "KH",
	CA = "CA",
	CV = "CV",
	BQ = "BQ",
	KY = "KY",
	CF = "CF",
	TD = "TD",
	CL = "CL",
	CN = "CN",
	CX = "CX",
	CC = "CC",
	CO = "CO",
	KM = "KM",
	CG = "CG",
	CD = "CD",
	CK = "CK",
	CR = "CR",
	HR = "HR",
	CU = "CU",
	CW = "CW",
	CY = "CY",
	CZ = "CZ",
	CI = "CI",
	DK = "DK",
	DJ = "DJ",
	DM = "DM",
	DO = "DO",
	EC = "EC",
	EG = "EG",
	SV = "SV",
	GQ = "GQ",
	ER = "ER",
	EE = "EE",
	SZ = "SZ",
	ET = "ET",
	FK = "FK",
	FO = "FO",
	FJ = "FJ",
	FI = "FI",
	FR = "FR",
	GF = "GF",
	PF = "PF",
	TF = "TF",
	GA = "GA",
	GM = "GM",
	GE = "GE",
	DE = "DE",
	GH = "GH",
	GI = "GI",
	GR = "GR",
	GL = "GL",
	GD = "GD",
	GP = "GP",
	GT = "GT",
	GG = "GG",
	GN = "GN",
	GW = "GW",
	GY = "GY",
	HT = "HT",
	HM = "HM",
	VA = "VA",
	HN = "HN",
	HK = "HK",
	HU = "HU",
	IS = "IS",
	IN = "IN",
	ID = "ID",
	IR = "IR",
	IQ = "IQ",
	IE = "IE",
	IM = "IM",
	IL = "IL",
	IT = "IT",
	JM = "JM",
	JP = "JP",
	JE = "JE",
	JO = "JO",
	KZ = "KZ",
	KE = "KE",
	KI = "KI",
	KP = "KP",
	XK = "XK",
	KW = "KW",
	KG = "KG",
	LA = "LA",
	LV = "LV",
	LB = "LB",
	LS = "LS",
	LR = "LR",
	LY = "LY",
	LI = "LI",
	LT = "LT",
	LU = "LU",
	MO = "MO",
	MG = "MG",
	MW = "MW",
	MY = "MY",
	MV = "MV",
	ML = "ML",
	MT = "MT",
	MQ = "MQ",
	MR = "MR",
	MU = "MU",
	YT = "YT",
	MX = "MX",
	MD = "MD",
	MC = "MC",
	MN = "MN",
	ME = "ME",
	MS = "MS",
	MA = "MA",
	MZ = "MZ",
	MM = "MM",
	NA = "NA",
	NR = "NR",
	NP = "NP",
	NL = "NL",
	AN = "AN",
	NC = "NC",
	NZ = "NZ",
	NI = "NI",
	NE = "NE",
	NG = "NG",
	NU = "NU",
	NF = "NF",
	MK = "MK",
	NO = "NO",
	OM = "OM",
	PK = "PK",
	PS = "PS",
	PA = "PA",
	PG = "PG",
	PY = "PY",
	PE = "PE",
	PH = "PH",
	PN = "PN",
	PL = "PL",
	PT = "PT",
	QA = "QA",
	CM = "CM",
	RE = "RE",
	RO = "RO",
	RU = "RU",
	RW = "RW",
	BL = "BL",
	SH = "SH",
	KN = "KN",
	LC = "LC",
	MF = "MF",
	PM = "PM",
	WS = "WS",
	SM = "SM",
	ST = "ST",
	SA = "SA",
	SN = "SN",
	RS = "RS",
	SC = "SC",
	SL = "SL",
	SG = "SG",
	SX = "SX",
	SK = "SK",
	SI = "SI",
	SB = "SB",
	SO = "SO",
	ZA = "ZA",
	GS = "GS",
	KR = "KR",
	SS = "SS",
	ES = "ES",
	LK = "LK",
	VC = "VC",
	SD = "SD",
	SR = "SR",
	SJ = "SJ",
	SE = "SE",
	CH = "CH",
	SY = "SY",
	TW = "TW",
	TJ = "TJ",
	TZ = "TZ",
	TH = "TH",
	TL = "TL",
	TG = "TG",
	TK = "TK",
	TO = "TO",
	TT = "TT",
	TA = "TA",
	TN = "TN",
	TR = "TR",
	TM = "TM",
	TC = "TC",
	TV = "TV",
	UG = "UG",
	UA = "UA",
	AE = "AE",
	GB = "GB",
	US = "US",
	UM = "UM",
	UY = "UY",
	UZ = "UZ",
	VU = "VU",
	VE = "VE",
	VN = "VN",
	VG = "VG",
	WF = "WF",
	EH = "EH",
	YE = "YE",
	ZM = "ZM",
	ZW = "ZW",
	ZZ = "ZZ"
}
/** The part of the image that should remain after cropping. */
export const enum CropRegion {
	CENTER = "CENTER",
	TOP = "TOP",
	BOTTOM = "BOTTOM",
	LEFT = "LEFT",
	RIGHT = "RIGHT"
}
/** The three-letter currency codes that represent the world currencies used in stores. These include standard ISO 4217 codes, legacy codes,
and non-standard codes.
 */
export const enum CurrencyCode {
	USD = "USD",
	EUR = "EUR",
	GBP = "GBP",
	CAD = "CAD",
	AFN = "AFN",
	ALL = "ALL",
	DZD = "DZD",
	AOA = "AOA",
	ARS = "ARS",
	AMD = "AMD",
	AWG = "AWG",
	AUD = "AUD",
	BBD = "BBD",
	AZN = "AZN",
	BDT = "BDT",
	BSD = "BSD",
	BHD = "BHD",
	BIF = "BIF",
	BZD = "BZD",
	BMD = "BMD",
	BTN = "BTN",
	BAM = "BAM",
	BRL = "BRL",
	BOB = "BOB",
	BWP = "BWP",
	BND = "BND",
	BGN = "BGN",
	MMK = "MMK",
	KHR = "KHR",
	CVE = "CVE",
	KYD = "KYD",
	XAF = "XAF",
	CLP = "CLP",
	CNY = "CNY",
	COP = "COP",
	KMF = "KMF",
	CDF = "CDF",
	CRC = "CRC",
	HRK = "HRK",
	CZK = "CZK",
	DKK = "DKK",
	DOP = "DOP",
	XCD = "XCD",
	EGP = "EGP",
	ETB = "ETB",
	XPF = "XPF",
	FJD = "FJD",
	GMD = "GMD",
	GHS = "GHS",
	GTQ = "GTQ",
	GYD = "GYD",
	GEL = "GEL",
	HTG = "HTG",
	HNL = "HNL",
	HKD = "HKD",
	HUF = "HUF",
	ISK = "ISK",
	INR = "INR",
	IDR = "IDR",
	ILS = "ILS",
	IQD = "IQD",
	JMD = "JMD",
	JPY = "JPY",
	JEP = "JEP",
	JOD = "JOD",
	KZT = "KZT",
	KES = "KES",
	KWD = "KWD",
	KGS = "KGS",
	LAK = "LAK",
	LVL = "LVL",
	LBP = "LBP",
	LSL = "LSL",
	LRD = "LRD",
	LTL = "LTL",
	MGA = "MGA",
	MKD = "MKD",
	MOP = "MOP",
	MWK = "MWK",
	MVR = "MVR",
	MXN = "MXN",
	MYR = "MYR",
	MUR = "MUR",
	MDL = "MDL",
	MAD = "MAD",
	MNT = "MNT",
	MZN = "MZN",
	NAD = "NAD",
	NPR = "NPR",
	ANG = "ANG",
	NZD = "NZD",
	NIO = "NIO",
	NGN = "NGN",
	NOK = "NOK",
	OMR = "OMR",
	PAB = "PAB",
	PKR = "PKR",
	PGK = "PGK",
	PYG = "PYG",
	PEN = "PEN",
	PHP = "PHP",
	PLN = "PLN",
	QAR = "QAR",
	RON = "RON",
	RUB = "RUB",
	RWF = "RWF",
	WST = "WST",
	SAR = "SAR",
	RSD = "RSD",
	SCR = "SCR",
	SGD = "SGD",
	SDG = "SDG",
	SYP = "SYP",
	ZAR = "ZAR",
	KRW = "KRW",
	SSP = "SSP",
	SBD = "SBD",
	LKR = "LKR",
	SRD = "SRD",
	SZL = "SZL",
	SEK = "SEK",
	CHF = "CHF",
	TWD = "TWD",
	THB = "THB",
	TZS = "TZS",
	TTD = "TTD",
	TND = "TND",
	TRY = "TRY",
	TMT = "TMT",
	UGX = "UGX",
	UAH = "UAH",
	AED = "AED",
	UYU = "UYU",
	UZS = "UZS",
	VUV = "VUV",
	VND = "VND",
	XOF = "XOF",
	YER = "YER",
	ZMW = "ZMW",
	BYN = "BYN",
	BYR = "BYR",
	DJF = "DJF",
	ERN = "ERN",
	FKP = "FKP",
	GIP = "GIP",
	GNF = "GNF",
	IRR = "IRR",
	KID = "KID",
	LYD = "LYD",
	MRU = "MRU",
	SLL = "SLL",
	SHP = "SHP",
	SOS = "SOS",
	STD = "STD",
	STN = "STN",
	TJS = "TJS",
	TOP = "TOP",
	VED = "VED",
	VEF = "VEF",
	VES = "VES",
	XXX = "XXX"
}
/** Possible error codes that can be returned by `CustomerUserError`. */
export const enum CustomerErrorCode {
	BLANK = "BLANK",
	INVALID = "INVALID",
	TAKEN = "TAKEN",
	TOO_LONG = "TOO_LONG",
	TOO_SHORT = "TOO_SHORT",
	UNIDENTIFIED_CUSTOMER = "UNIDENTIFIED_CUSTOMER",
	CUSTOMER_DISABLED = "CUSTOMER_DISABLED",
	PASSWORD_STARTS_OR_ENDS_WITH_WHITESPACE = "PASSWORD_STARTS_OR_ENDS_WITH_WHITESPACE",
	CONTAINS_HTML_TAGS = "CONTAINS_HTML_TAGS",
	CONTAINS_URL = "CONTAINS_URL",
	TOKEN_INVALID = "TOKEN_INVALID",
	ALREADY_ENABLED = "ALREADY_ENABLED",
	NOT_FOUND = "NOT_FOUND",
	BAD_DOMAIN = "BAD_DOMAIN",
	INVALID_MULTIPASS_REQUEST = "INVALID_MULTIPASS_REQUEST"
}
/** List of different delivery method types. */
export const enum DeliveryMethodType {
	SHIPPING = "SHIPPING",
	PICK_UP = "PICK_UP",
	RETAIL = "RETAIL",
	LOCAL = "LOCAL",
	PICKUP_POINT = "PICKUP_POINT",
	NONE = "NONE"
}
/** Digital wallet, such as Apple Pay, which can be used for accelerated checkouts. */
export const enum DigitalWallet {
	APPLE_PAY = "APPLE_PAY",
	ANDROID_PAY = "ANDROID_PAY",
	GOOGLE_PAY = "GOOGLE_PAY",
	SHOPIFY_PAY = "SHOPIFY_PAY"
}
/** The method by which the discount's value is allocated onto its entitled lines. */
export const enum DiscountApplicationAllocationMethod {
	ACROSS = "ACROSS",
	EACH = "EACH",
	ONE = "ONE"
}
/** The lines on the order to which the discount is applied, of the type defined by
the discount application's `targetType`. For example, the value `ENTITLED`, combined with a `targetType` of
`LINE_ITEM`, applies the discount on all line items that are entitled to the discount.
The value `ALL`, combined with a `targetType` of `SHIPPING_LINE`, applies the discount on all shipping lines.
 */
export const enum DiscountApplicationTargetSelection {
	ALL = "ALL",
	ENTITLED = "ENTITLED",
	EXPLICIT = "EXPLICIT"
}
/** The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards.
 */
export const enum DiscountApplicationTargetType {
	LINE_ITEM = "LINE_ITEM",
	SHIPPING_LINE = "SHIPPING_LINE"
}
/** The type of data that the filter group represents.

For more information, refer to [Filter products in a collection with the Storefront API]
(https://shopify.dev/custom-storefronts/products-collections/filter-products).
 */
export const enum FilterType {
	LIST = "LIST",
	PRICE_RANGE = "PRICE_RANGE",
	BOOLEAN = "BOOLEAN"
}
/** List of supported image content types. */
export const enum ImageContentType {
	PNG = "PNG",
	JPG = "JPG",
	WEBP = "WEBP"
}
/** ISO 639-1 language codes supported by Shopify. */
export const enum LanguageCode {
	AF = "AF",
	AK = "AK",
	AM = "AM",
	AR = "AR",
	AS = "AS",
	AZ = "AZ",
	BE = "BE",
	BG = "BG",
	BM = "BM",
	BN = "BN",
	BO = "BO",
	BR = "BR",
	BS = "BS",
	CA = "CA",
	CE = "CE",
	CS = "CS",
	CY = "CY",
	DA = "DA",
	DE = "DE",
	DZ = "DZ",
	EE = "EE",
	EL = "EL",
	EN = "EN",
	EO = "EO",
	ES = "ES",
	ET = "ET",
	EU = "EU",
	FA = "FA",
	FF = "FF",
	FI = "FI",
	FO = "FO",
	FR = "FR",
	FY = "FY",
	GA = "GA",
	GD = "GD",
	GL = "GL",
	GU = "GU",
	GV = "GV",
	HA = "HA",
	HE = "HE",
	HI = "HI",
	HR = "HR",
	HU = "HU",
	HY = "HY",
	IA = "IA",
	ID = "ID",
	IG = "IG",
	II = "II",
	IS = "IS",
	IT = "IT",
	JA = "JA",
	JV = "JV",
	KA = "KA",
	KI = "KI",
	KK = "KK",
	KL = "KL",
	KM = "KM",
	KN = "KN",
	KO = "KO",
	KS = "KS",
	KU = "KU",
	KW = "KW",
	KY = "KY",
	LB = "LB",
	LG = "LG",
	LN = "LN",
	LO = "LO",
	LT = "LT",
	LU = "LU",
	LV = "LV",
	MG = "MG",
	MI = "MI",
	MK = "MK",
	ML = "ML",
	MN = "MN",
	MR = "MR",
	MS = "MS",
	MT = "MT",
	MY = "MY",
	NB = "NB",
	ND = "ND",
	NE = "NE",
	NL = "NL",
	NN = "NN",
	NO = "NO",
	OM = "OM",
	OR = "OR",
	OS = "OS",
	PA = "PA",
	PL = "PL",
	PS = "PS",
	PT_BR = "PT_BR",
	PT_PT = "PT_PT",
	QU = "QU",
	RM = "RM",
	RN = "RN",
	RO = "RO",
	RU = "RU",
	RW = "RW",
	SD = "SD",
	SE = "SE",
	SG = "SG",
	SI = "SI",
	SK = "SK",
	SL = "SL",
	SN = "SN",
	SO = "SO",
	SQ = "SQ",
	SR = "SR",
	SU = "SU",
	SV = "SV",
	SW = "SW",
	TA = "TA",
	TE = "TE",
	TG = "TG",
	TH = "TH",
	TI = "TI",
	TK = "TK",
	TO = "TO",
	TR = "TR",
	TT = "TT",
	UG = "UG",
	UK = "UK",
	UR = "UR",
	UZ = "UZ",
	VI = "VI",
	WO = "WO",
	XH = "XH",
	YI = "YI",
	YO = "YO",
	ZH_CN = "ZH_CN",
	ZH_TW = "ZH_TW",
	ZU = "ZU",
	ZH = "ZH",
	PT = "PT",
	CU = "CU",
	VO = "VO"
}
/** The set of valid sort keys for the Location query. */
export const enum LocationSortKeys {
	ID = "ID",
	NAME = "NAME",
	CITY = "CITY",
	DISTANCE = "DISTANCE"
}
/** The possible content types for a media object. */
export const enum MediaContentType {
	EXTERNAL_VIDEO = "EXTERNAL_VIDEO",
	IMAGE = "IMAGE",
	MODEL_3D = "MODEL_3D",
	VIDEO = "VIDEO"
}
/** Host for a Media Resource. */
export const enum MediaHost {
	YOUTUBE = "YOUTUBE",
	VIMEO = "VIMEO"
}
/** A menu item type. */
export const enum MenuItemType {
	FRONTPAGE = "FRONTPAGE",
	COLLECTION = "COLLECTION",
	COLLECTIONS = "COLLECTIONS",
	PRODUCT = "PRODUCT",
	CATALOG = "CATALOG",
	PAGE = "PAGE",
	BLOG = "BLOG",
	ARTICLE = "ARTICLE",
	SEARCH = "SEARCH",
	SHOP_POLICY = "SHOP_POLICY",
	HTTP = "HTTP"
}
/** Represents the reason for the order's cancellation. */
export const enum OrderCancelReason {
	CUSTOMER = "CUSTOMER",
	DECLINED = "DECLINED",
	FRAUD = "FRAUD",
	INVENTORY = "INVENTORY",
	OTHER = "OTHER"
}
/** Represents the order's current financial status. */
export const enum OrderFinancialStatus {
	PENDING = "PENDING",
	AUTHORIZED = "AUTHORIZED",
	PARTIALLY_PAID = "PARTIALLY_PAID",
	PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
	VOIDED = "VOIDED",
	PAID = "PAID",
	REFUNDED = "REFUNDED"
}
/** Represents the order's aggregated fulfillment status for display purposes. */
export const enum OrderFulfillmentStatus {
	UNFULFILLED = "UNFULFILLED",
	PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED",
	FULFILLED = "FULFILLED",
	RESTOCKED = "RESTOCKED",
	PENDING_FULFILLMENT = "PENDING_FULFILLMENT",
	OPEN = "OPEN",
	IN_PROGRESS = "IN_PROGRESS",
	ON_HOLD = "ON_HOLD",
	SCHEDULED = "SCHEDULED"
}
/** The set of valid sort keys for the Order query. */
export const enum OrderSortKeys {
	PROCESSED_AT = "PROCESSED_AT",
	TOTAL_PRICE = "TOTAL_PRICE",
	ID = "ID",
	RELEVANCE = "RELEVANCE"
}
/** The set of valid sort keys for the Page query. */
export const enum PageSortKeys {
	TITLE = "TITLE",
	UPDATED_AT = "UPDATED_AT",
	ID = "ID",
	RELEVANCE = "RELEVANCE"
}
/** The valid values for the types of payment token. */
export const enum PaymentTokenType {
	APPLE_PAY = "APPLE_PAY",
	VAULT = "VAULT",
	SHOPIFY_PAY = "SHOPIFY_PAY",
	GOOGLE_PAY = "GOOGLE_PAY",
	STRIPE_VAULT_TOKEN = "STRIPE_VAULT_TOKEN"
}
/** The set of valid sort keys for the ProductCollection query. */
export const enum ProductCollectionSortKeys {
	TITLE = "TITLE",
	PRICE = "PRICE",
	BEST_SELLING = "BEST_SELLING",
	CREATED = "CREATED",
	ID = "ID",
	MANUAL = "MANUAL",
	COLLECTION_DEFAULT = "COLLECTION_DEFAULT",
	RELEVANCE = "RELEVANCE"
}
/** The set of valid sort keys for the ProductImage query. */
export const enum ProductImageSortKeys {
	CREATED_AT = "CREATED_AT",
	POSITION = "POSITION",
	ID = "ID",
	RELEVANCE = "RELEVANCE"
}
/** The set of valid sort keys for the ProductMedia query. */
export const enum ProductMediaSortKeys {
	POSITION = "POSITION",
	ID = "ID",
	RELEVANCE = "RELEVANCE"
}
/** The set of valid sort keys for the Product query. */
export const enum ProductSortKeys {
	TITLE = "TITLE",
	PRODUCT_TYPE = "PRODUCT_TYPE",
	VENDOR = "VENDOR",
	UPDATED_AT = "UPDATED_AT",
	CREATED_AT = "CREATED_AT",
	BEST_SELLING = "BEST_SELLING",
	PRICE = "PRICE",
	ID = "ID",
	RELEVANCE = "RELEVANCE"
}
/** The set of valid sort keys for the ProductVariant query. */
export const enum ProductVariantSortKeys {
	TITLE = "TITLE",
	SKU = "SKU",
	POSITION = "POSITION",
	ID = "ID",
	RELEVANCE = "RELEVANCE"
}
/** The checkout charge when the full amount isn't charged at checkout. */
export const enum SellingPlanCheckoutChargeType {
	PERCENTAGE = "PERCENTAGE",
	PRICE = "PRICE"
}
/** The different kinds of order transactions. */
export const enum TransactionKind {
	SALE = "SALE",
	CAPTURE = "CAPTURE",
	AUTHORIZATION = "AUTHORIZATION",
	EMV_AUTHORIZATION = "EMV_AUTHORIZATION",
	CHANGE = "CHANGE"
}
/** Transaction statuses describe the status of a transaction. */
export const enum TransactionStatus {
	PENDING = "PENDING",
	SUCCESS = "SUCCESS",
	FAILURE = "FAILURE",
	ERROR = "ERROR"
}
/** The accepted types of unit of measurement. */
export const enum UnitPriceMeasurementMeasuredType {
	VOLUME = "VOLUME",
	WEIGHT = "WEIGHT",
	LENGTH = "LENGTH",
	AREA = "AREA"
}
/** The valid units of measurement for a unit price measurement. */
export const enum UnitPriceMeasurementMeasuredUnit {
	ML = "ML",
	CL = "CL",
	L = "L",
	M3 = "M3",
	MG = "MG",
	G = "G",
	KG = "KG",
	MM = "MM",
	CM = "CM",
	M = "M",
	M2 = "M2"
}
/** Systems of weights and measures. */
export const enum UnitSystem {
	IMPERIAL_SYSTEM = "IMPERIAL_SYSTEM",
	METRIC_SYSTEM = "METRIC_SYSTEM"
}
/** Units of measurement for weight. */
export const enum WeightUnit {
	KILOGRAMS = "KILOGRAMS",
	GRAMS = "GRAMS",
	POUNDS = "POUNDS",
	OUNCES = "OUNCES"
}

type ZEUS_VARIABLES = {
	["ArticleSortKeys"]: ValueTypes["ArticleSortKeys"];
	["AttributeInput"]: ValueTypes["AttributeInput"];
	["BlogSortKeys"]: ValueTypes["BlogSortKeys"];
	["CardBrand"]: ValueTypes["CardBrand"];
	["CartBuyerIdentityInput"]: ValueTypes["CartBuyerIdentityInput"];
	["CartErrorCode"]: ValueTypes["CartErrorCode"];
	["CartInput"]: ValueTypes["CartInput"];
	["CartLineInput"]: ValueTypes["CartLineInput"];
	["CartLineUpdateInput"]: ValueTypes["CartLineUpdateInput"];
	["CartSelectedDeliveryOptionInput"]: ValueTypes["CartSelectedDeliveryOptionInput"];
	["CheckoutAttributesUpdateV2Input"]: ValueTypes["CheckoutAttributesUpdateV2Input"];
	["CheckoutBuyerIdentityInput"]: ValueTypes["CheckoutBuyerIdentityInput"];
	["CheckoutCreateInput"]: ValueTypes["CheckoutCreateInput"];
	["CheckoutErrorCode"]: ValueTypes["CheckoutErrorCode"];
	["CheckoutLineItemInput"]: ValueTypes["CheckoutLineItemInput"];
	["CheckoutLineItemUpdateInput"]: ValueTypes["CheckoutLineItemUpdateInput"];
	["CollectionSortKeys"]: ValueTypes["CollectionSortKeys"];
	["Color"]: ValueTypes["Color"];
	["CountryCode"]: ValueTypes["CountryCode"];
	["CreditCardPaymentInputV2"]: ValueTypes["CreditCardPaymentInputV2"];
	["CropRegion"]: ValueTypes["CropRegion"];
	["CurrencyCode"]: ValueTypes["CurrencyCode"];
	["CustomerAccessTokenCreateInput"]: ValueTypes["CustomerAccessTokenCreateInput"];
	["CustomerActivateInput"]: ValueTypes["CustomerActivateInput"];
	["CustomerCreateInput"]: ValueTypes["CustomerCreateInput"];
	["CustomerErrorCode"]: ValueTypes["CustomerErrorCode"];
	["CustomerResetInput"]: ValueTypes["CustomerResetInput"];
	["CustomerUpdateInput"]: ValueTypes["CustomerUpdateInput"];
	["DateTime"]: ValueTypes["DateTime"];
	["Decimal"]: ValueTypes["Decimal"];
	["DeliveryAddressInput"]: ValueTypes["DeliveryAddressInput"];
	["DeliveryMethodType"]: ValueTypes["DeliveryMethodType"];
	["DigitalWallet"]: ValueTypes["DigitalWallet"];
	["DiscountApplicationAllocationMethod"]: ValueTypes["DiscountApplicationAllocationMethod"];
	["DiscountApplicationTargetSelection"]: ValueTypes["DiscountApplicationTargetSelection"];
	["DiscountApplicationTargetType"]: ValueTypes["DiscountApplicationTargetType"];
	["FilterType"]: ValueTypes["FilterType"];
	["GeoCoordinateInput"]: ValueTypes["GeoCoordinateInput"];
	["HTML"]: ValueTypes["HTML"];
	["HasMetafieldsIdentifier"]: ValueTypes["HasMetafieldsIdentifier"];
	["ImageContentType"]: ValueTypes["ImageContentType"];
	["ImageTransformInput"]: ValueTypes["ImageTransformInput"];
	["JSON"]: ValueTypes["JSON"];
	["LanguageCode"]: ValueTypes["LanguageCode"];
	["LocationSortKeys"]: ValueTypes["LocationSortKeys"];
	["MailingAddressInput"]: ValueTypes["MailingAddressInput"];
	["MediaContentType"]: ValueTypes["MediaContentType"];
	["MediaHost"]: ValueTypes["MediaHost"];
	["MenuItemType"]: ValueTypes["MenuItemType"];
	["MetafieldFilter"]: ValueTypes["MetafieldFilter"];
	["MetaobjectHandleInput"]: ValueTypes["MetaobjectHandleInput"];
	["MoneyInput"]: ValueTypes["MoneyInput"];
	["OrderCancelReason"]: ValueTypes["OrderCancelReason"];
	["OrderFinancialStatus"]: ValueTypes["OrderFinancialStatus"];
	["OrderFulfillmentStatus"]: ValueTypes["OrderFulfillmentStatus"];
	["OrderSortKeys"]: ValueTypes["OrderSortKeys"];
	["PageSortKeys"]: ValueTypes["PageSortKeys"];
	["PaymentTokenType"]: ValueTypes["PaymentTokenType"];
	["PriceRangeFilter"]: ValueTypes["PriceRangeFilter"];
	["ProductCollectionSortKeys"]: ValueTypes["ProductCollectionSortKeys"];
	["ProductFilter"]: ValueTypes["ProductFilter"];
	["ProductImageSortKeys"]: ValueTypes["ProductImageSortKeys"];
	["ProductMediaSortKeys"]: ValueTypes["ProductMediaSortKeys"];
	["ProductSortKeys"]: ValueTypes["ProductSortKeys"];
	["ProductVariantSortKeys"]: ValueTypes["ProductVariantSortKeys"];
	["SelectedOptionInput"]: ValueTypes["SelectedOptionInput"];
	["SellingPlanCheckoutChargeType"]: ValueTypes["SellingPlanCheckoutChargeType"];
	["TokenizedPaymentInputV3"]: ValueTypes["TokenizedPaymentInputV3"];
	["TransactionKind"]: ValueTypes["TransactionKind"];
	["TransactionStatus"]: ValueTypes["TransactionStatus"];
	["URL"]: ValueTypes["URL"];
	["UnitPriceMeasurementMeasuredType"]: ValueTypes["UnitPriceMeasurementMeasuredType"];
	["UnitPriceMeasurementMeasuredUnit"]: ValueTypes["UnitPriceMeasurementMeasuredUnit"];
	["UnitSystem"]: ValueTypes["UnitSystem"];
	["UnsignedInt64"]: ValueTypes["UnsignedInt64"];
	["VariantOptionFilter"]: ValueTypes["VariantOptionFilter"];
	["WeightUnit"]: ValueTypes["WeightUnit"];
}