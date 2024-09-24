
export interface ISourceType {
    /**
     * 条件类型
     *
     * @type {string}
     * @memberof ISourceType
     */
    condition: string;

    /**
     * 公式类型
     *
     * @type {string}
     * @memberof ISourceType
     */
    formula: string;

    /**
     * 函数类型
     *
     * @type {string}
     * @memberof ISourceType
     */
    fn: string;

    /**
     * 限制类型
     *
     * @type {string}
     * @memberof ISourceType
     */
    limit: string;
}

// @see https://developers.google.com/protocol-buffers/docs/proto3#scalar
export interface ProtoBufScalar extends ISourceType {
    double: string;
    float: string;
    int32: string;
    int64: string;
    uint32: string;
    uint64: string;
    sint32: string;
    sint64: string;
    fixed32: string;
    fixed64: string;
    sfixed32: string;
    sfixed64: string;
    bool: string;
    string: string;
    bytes: string;
}

export type ProtoBufScalarType = keyof ProtoBufScalar;

/**
 * @see https://github.com/microsoft/TypeScript/blob/master/src/compiler/scanner.ts#L161
 *
 * @enum {number}
 */
export const enum KeyWords {
    Super = "super",
    Declare = "declare",
    Global = "global",
    Object = "object",
    Space = " ",
    Enum = "enum",
    Interface = "interface",
    Register = "register",
    ScalarType = "ScalarType",
    PACKER_LIST = "PACKER(LIST)",
    PACKER_MAP = "PACKER(MAP)",
    PACKER_KV = "PACKER(KV)",
    PACKER_ENUM = "PACKER(ENUM)",
    IDOBJ = "IDOBJ",
    IDKEY = "IDKEY",
    IDVALUE = "IDVALUE",
    IDTYPE = "IDTYPE",
    NAME = "name",
    OpenBraceToken = "{",
    CloseBraceToken = "}",
    OpenParenToken = "(",
    CloseParenToken = ")",
    OpenBracketToken = "[",
    CloseBracketToken = "]",
    CommaToken = ",",
    SemicolonToken = ";",
}

export enum ScalarTypeValue {
    DOUBLE = 1,
    FLOAT = 2,
    INT64 = 3,
    UINT64 = 4,
    INT32 = 5,
    FIXED64 = 6,
    FIXED32 = 7,
    BOOL = 8,
    STRING = 9,
    BYTES = 12,
    UINT32 = 13,
    SFIXED32 = 15,
    SFIXED64 = 16,
    SINT32 = 17,
    SINT64 = 18,
}

export interface PQInput {
    source: {
        indx: number;
        name: string;
        type: ProtoBufScalarType;
    };
    idx: number;
    values: {
        [key: number]: {
            text: string | number | undefined;
        };
    };
    data: { [key: string]: any };
    type: string;
}

export interface PQWorkBook {
    /**
     * WorkSheet name
     *
     * @type {string}
     * @memberof PQWorkBook
     */
    name: string;

    /**
     * 内容
     *
     * @type {({
     *         // 0 表示表内容解释
     *         0: { cells: { 0: { text: string } } },
     *         //
     *         1: {
     *             cells: {
     *                 0: { text: "变量表头" },
     *                 [key: number]: { text: string | number }
     *             }
     *         },
     *         2: {
     *             cells: {
     *                 0: { text: "非空标识" },
     *                 [key: number]: { text: string | number }
     *             }
     *         },
     *         3: {
     *             cells: {
     *                 0: { text: "变量名称" },
     *                 [key: number]: { text: string | number }
     *             }
     *         },
     *         4: {
     *             cells: {
     *                 0: { text: "变量类型" },
     *                 [key: number]: { text: k | "变量类型" }
     *             }
     *         }
     *         [key: number]: {
     *             cells: {
     *                 [key: number]: { text: string | number }
     *             }
     *         }
     *     })}
     * @memberof PQWorkBook
     */
    rows: {
        // 0 表示表内容解释
        // 1 表示表的ID(用来打包解包)
        0: { cells: { 0: { text: string }; 1: { text: number }; 2: { text: number } } };
        //
        1: {
            cells: {
                0: { text: "变量表头" };
                [key: number]: { text: string | number };
            };
        };
        2: {
            cells: {
                0: { text: "非空标识" };
                [key: number]: { text: string | number };
            };
        };
        3: {
            cells: {
                0: { text: "变量名称" };
                [key: number]: { text: string | number };
            };
        };
        4: {
            cells: {
                0: { text: "变量类型" };
                [key: number]: { text: ProtoBufScalarType | "变量类型" };
            };
        };
        5: {
            cells: {
                [key: number]: {
                    text: `${KeyWords.PACKER_LIST}` | `${KeyWords.IDKEY}` | `${KeyWords.IDVALUE}` | string;
                };
            };
        };
        [key: number]: {
            cells: {
                [key: number]: { text: string | number };
            };
        };
    };

    types: {
        indx: number;
        name: string;
        type: string;
    }[];
}
