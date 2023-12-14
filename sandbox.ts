import { Slice, Builder, beginCell } from "ton";
export type Maybe<TheType> = {
	value: TheType;
};

export function loadMaybe<TheType>(slice: Slice, loadTheType: (slice: Slice) => TheType): Maybe<TheType> {
	return {
		value: loadTheType(slice)
	};
}

export function storeMaybe<TheType>(maybe: Maybe<TheType>, storeSubType: (TheType: TheType) => ((builder: Builder) => void)): ((builder: Builder) => void) {
	return (builder: Builder) => {
		storeSubType(maybe.value)(builder);
	};
}

export type TheJust = {
	x: Maybe<number>
};

function loadTheNumber(slice: Slice): number {
	return slice.loadUint(32);
}

function storeTheNumber(n: number): ((builder: Builder) => void) {
	return (builder: Builder) => {
		builder.storeUint(n, 32);
	}
}

export function loadTheJust(slice: Slice): TheJust {
	return {
		x: loadMaybe<number>(slice, loadTheNumber)
	};
}
export function storeTheJust(theJust: TheJust): Builder {
	return (builder: Builder) => {
		storeMaybe<number>(theJust.x, storeTheNumber)(builder);
	};
}



export type Example = {
	value: number;
	x: number;
};
export function loadExample(slice: Slice, x: number): Example {
	return {
		value: slice.loadUint(x),
		x: x
	};
}
export function storeExample(example: Example): Builder {
	return (builder: Builder) => {
		builder.storeUint(example.value, example.x)
	};
}

export type BitInteger = {
	e: Example;
};
export function loadBitInteger(slice: Slice): BitInteger {
	return {
		e: loadExample(slice, 4)
	};
}
export function storeBitInteger(bitInteger: BitInteger): Builder {
	return (builder: Builder) => {
		storeExample(bitInteger.e)(builder);
	};
}



export type Example2 = {
	value: number;
	x: number;
};
export function loadExample2(slice: Slice, x: number): Example {
	return {
		value: slice.loadUint(x / 2),
		x: x / 2
	};
}
export function storeExample2(example: Example2): Builder {
	return (builder: Builder) => {
		builder.storeUint(example.value, example.x)
	};
}

export type BitInteger2 = {
	e: Example2;
};
export function loadBitInteger2(slice: Slice): BitInteger2 {
	return {
		e: loadExample2(slice, 4)
	};
}
export function storeBitInteger2(bitInteger: BitInteger2): Builder {
	return (builder: Builder) => {
		storeExample2(bitInteger.e)(builder);
	};
}



export type Unary = Unary_unary_zero | Unary_unary_succ;
export type Unary_unary_zero = {

};
export type Unary_unary_succ = {
	n: number;
	x: Unary;
};

export function loadUnary(slice: Slice, n: number): Unary {
	if (slice.preloadUint(1) == 0b0) {
		return {

		};
	};
	if (slice.preloadUint(1) == 0b1) {
		return {
			n: n - 1,
			x: loadUnary(slice, n - 1)
		};
	};
	return {}
}
export function storeUnary(unary: Unary): Builder {
	if (unary instanceof Unary_unary_zero) {
		return (builder: Builder) => {
			builder.storeUint(0b0, 1);
		};
	};
	if (unary instanceof Unary_unary_succ) {
		return (builder: Builder) => {
			builder.storeUint(0b1, 1);
			storeUnary(unary.x)(builder);
		};
	};
}


//a$_ t:# ^[ a:(## 32) ^[e:#] ^[ b:(## 32) d:# ^[ c:(## 32) ] ] ] = A;

export function loadA(slice: Slice): A {
	let slice1 = slice.loadRef().beginParse();
	let slice11 = slice1.loadRef().beginParse();
	let slice12 = slice1.loadRef().beginParse();
	let slice121 = slice12.loadRef().beginParse();
	return {
		t: slice.loadUint(32),
		a: slice1.loadUint(32),
		e: slice11.loadUint(32),
		b: slice12.loadUint(32),
		d: slice12.loadUint(32),
		c: slice121.loadUint(32)
	};
}



<ref * 1 > FieldAnonymousDef {
	name: null,
		isRef: true,
			fields: [
				FieldNamedDef {
					name: 'a',
					expr: [BuiltinOneArgExpr],
					locations: [Object],
					parent: [Circular * 1]
				},
				FieldAnonymousDef {
					name: null,
					isRef: true,
					fields: [Array],
					locations: [Object],
					parent: [Circular * 1]
				},
				FieldAnonymousDef {
					name: null,
					isRef: true,
					fields: [Array],
					locations: [Object],
					parent: [Circular * 1]
				}
			]
}



export function storeA(a: A): (builder: Builder) => void {
	return (builder: Builder) => {
		let cell1 = beginCell();
		let cell2 = beginCell();
		let cell21 = beginCell();
		let cell22 = beginCell();
		let cell221 = beginCell();

		builder.storeUint(a.t, 32);
		cell1.storeUint(a.q, 32);
		cell2.storeUint(a.a, 32);
		cell21.storeUint(a.e, 32);
		cell22.storeUint(a.b, 32);
		cell22.storeUint(a.d, 32);
		cell221.storeUint(a.c, 32);

		cell22.storeRef(cell221);
		cell2.storeRef(cell21);
		cell2.storeRef(cell22);
		builder.storeRef(cell1);
		builder.storeRef(cell2);
	};
}

export function loadIntEx(slice: Slice): IntEx {
	let slice1 = slice.loadRef().beginParse();
	let a = slice.loadUint(257);
	let b = slice1.loadBits(1023);
	let c = slice.loadUint(256);
	let d = slice.loadInt(73);
	let e = slice.loadUint(89);
	let g = slice.loadBits(10);
	let h = slice.loadUint(e * 8);
	return {
		a: a,
		b: b,
		c: c,
		d: d,
		e: e,
		g: g,
		h: h
	};
}




export type IntexArg = {
	a: IntEx<number>;
};
export function loadIntexArg(slice: Slice): IntexArg {
	return {
		a: loadIntEx(slice, (slice: Slice) => { return slice.loadUint(22); })
	};
}


export function storeIntexArg(intexArg: IntexArg): (builder: Builder) => void {
	return (builder: Builder) => {
		storeIntEx(intexArg.a, (arg: number) => { return (builder: Builder) => { builder.storeUint(arg, 22); } })(builder);
	};
}

let x;
x = a;


export function loadUnary(slice: Slice): Unary {
	if (slice.preloadUint(1) == 0b0) {
		return {
			kind: 'Unary_unary_zero'
		};
	};
	if (slice.preloadUint(1) == 0b1) {
		let x = loadUnary(slice);
		return {
			kind: 'Unary_unary_succ',
			n: x.n + 1,
			x: x
		};
	};
	throw new Error('');
}

export type ParamDifNames = ParamDifNames_a | ParamDifNames_b | ParamDifNames_c;
export type ParamDifNames_a = {
	kind: 'ParamDifNames_a';
};
export type ParamDifNames_b = {
	kind: 'ParamDifNames_b';
	n: number;
	x: ParamDifNames;
};
export type ParamDifNames_c = {
	kind: 'ParamDifNames_c';
	m: number;
	x: ParamDifNames;
};


function paramDifNames_b_get_n(paramDifNames: ParamDifNames): number {
	if (paramDifNames.kind == 'ParamDifNames_a') {
		return 0;
	}
	if (paramDifNames.kind == 'ParamDifNames_b') {
		return paramDifNames.n + 1;
	}
	if (paramDifNames.kind == 'ParamDifNames_c') {
		return paramDifNames.m * 2;
	}
	throw new Error('Cannot identify n for ParamDifNames:b')
}

function paramDifNames_c_get_m(paramDifNames: ParamDifNames): number {
	if (paramDifNames.kind == 'ParamDifNames_a') {
		return 0;
	}
	if (paramDifNames.kind == 'ParamDifNames_b') {
		return paramDifNames.n + 1;
	}
	if (paramDifNames.kind == 'ParamDifNames_c') {
		return paramDifNames.m * 2;
	}
	throw new Error('Cannot identify n for ParamDifNames:c')
}

export function loadParamDifNames(slice: Slice, arg0: number): ParamDifNames {
	if (slice.preloadUint(1) == 0b0 && arg0 == 1) {
		return {
			kind: 'ParamDifNames_a',
		};
	};
	if (slice.preloadUint(1) == 0b1 && arg0 == 2) {
		let x: ParamDifNames = loadParamDifNames(slice, 2);
		return {
			kind: 'ParamDifNames_b',
			n: paramDifNames_b_get_n(x),
			x: x,
		};
	};
	if (slice.preloadUint(1) == 0b0 && arg0 == 3) {
		let x: ParamDifNames = loadParamDifNames(slice, 3);
		return {
			kind: 'ParamDifNames_c',
			m: paramDifNames_c_get_m(x),
			x: x,
		};
	};
	throw new Error('');
}


export type OneComb<A> = {
	kind: 'OneComb';
	t: number;
	x: A;
};
export function loadOneComb<A>(slice: Slice, loadA: (slice: Slice) => A): OneComb<A> {
	let t: number = slice.loadUint(32);
	let x: A = loadA(slice);
	return {
		kind: 'OneComb',
		t: t,
		x: x
	};
}
export function storeOneComb<A>(oneComb: OneComb<A>, storeA: (a: A) => (builder: Builder) => void): (builder: Builder) => void {
	return (builder: Builder) => {
		builder.storeUint(oneComb.t, 32);
		storeA(oneComb.x)(builder);
	};
}

export type ManyComb = {
	kind: 'ManyComb';
	y: OneComb<OneComb<OneComb<number>>>;
};
export function loadManyComb(slice: Slice): ManyComb {
	let y = loadOneComb(slice, () => loadOneComb(slice, () => loadOneComb(slice, () => { return slice.loadUint(3); })));
	return {
		kind: 'ManyComb',
		y: y
	};
}

export function storeManyComb(manyComb: ManyComb): (builder: Builder) => void {
	return (builder: Builder) => {
		storeOneComb<OneComb<OneComb<number>>>(manyComb.y, () => {
			return (builder: Builder) => {
				storeOneComb<OneComb<number>>(manyComb.y.x, () => {
					return (builder: Builder) => {
						storeOneComb<number>(manyComb.y.x.x, (arg: number) => {
							return (builder: Builder) => {
								builder.storeUint(arg, 3);
							};
						})(builder);
					};
				})(builder);
			};
		})(builder);
	};
};


export type Either<X,Y> = Either_left<X,Y> | Either_right<X,Y>;
export type Either_left<X,Y> = {
  	kind: 'Either_left';
	value: X;
  };
export type Either_right<X,Y> = {
  	kind: 'Either_right';
	value: Y;
  };
export function loadEither<X,Y>(slice: Slice, loadX: (slice: Slice) => X, loadY: (slice: Slice) => Y): Either<X,Y> {
  	if ((slice.preloadUint(1) == 0b0)) {
  		slice.loadUint(1);
		let value: X = loadX(slice);
		return {
  			kind: 'Either_left',
			value: value
  		};
  	};
	if ((slice.preloadUint(1) == 0b1)) {
  		slice.loadUint(1);
		let value: Y = loadY(slice);
		return {
  			kind: 'Either_right',
			value: value
  		};
  	};
	throw new Error('');
  }
export function storeEither<X,Y>(either: Either<X,Y>, storeX: (x: X) => (builder: Builder) => void, storeY: (y: Y) => (builder: Builder) => void): (builder: Builder) => void {
  	if ((either.kind == 'Either_left')) {
  		return (builder: Builder) => {
  			builder.storeUint(0b0, 1);
			storeX(either.value)(builder);
  		};
  	};
	if ((either.kind == 'Either_right')) {
  		return (builder: Builder) => {
  			builder.storeUint(0b1, 1);
			storeY(either.value)(builder);
  		};
  	};
	throw new Error('');
  }


export type CombArgCellRef<X> = {
	kind: 'CombArgCellRef';
  info: number;
  init: Maybe<Either<X,number>>;
  other: Either<X,OneComb<X>>;
  body: Either<X,X>;
};

// export function loadCombArgCellRef<X>(slice: Slice, loadX: (slice: Slice) => X): CombArgCellRef<X> {
// 	let info: number = slice.loadInt(32);
//   let init: Maybe<Either<X,X>> = loadMaybe<Either<X,X>>(slice, (slice: Slice) => {
// 		return loadEither<X,X>(slice, loadX, (slice: Slice) => {
// 		  slice = slice.loadRef().beginParse();
// 		  return (loadX)(slice);
// 	  });
// 	});
//   let body: Either<X,X> = loadEither<X,X>(slice, loadX, loadX);
//   let other: Either<X,X> = loadEither<X,X>(slice, loadX, loadX);

//   return {
// 		kind: 'CombArgCellRef',
// 	  info: info,
// 	  init: init,
// 	  body: body
// 	};
// }

// export function storeCombArgCellRef<X>(combArgCellRef: CombArgCellRef<X>, storeX: (x: X) => (builder: Builder) => void): (builder: Builder) => void {
// 	return (builder: Builder) => {
// 		builder.storeInt(combArgCellRef.info, 32);
// 	  storeMaybe<Either<X,X>>(combArgCellRef.init, (arg: Either<X,X>) => {
// 			return (builder: Builder) => {
// 				storeEither<X,X>(arg, storeX, (x: X) => {
// 				  return (builder: Builder) => {
// 					  let cell = beginCell();
// 					  storeX(x)(cell);
// 					  builder.storeRef(cell);
// 				  }
// 			  })(builder);
// 			};
// 		})(builder);
// 	  storeEither<X,X>(combArgCellRef.body, storeX, storeX)(builder);
// 	};
// }

export function storeCombArgCellRef<X>(combArgCellRef: CombArgCellRef<X>, storeX: (x: X) => (builder: Builder) => void): (builder: Builder) => void {
	return (builder: Builder) => {
		builder.storeInt(combArgCellRef.info, 32);
	  	storeMaybe<Either<X,number>>(combArgCellRef.init, (arg: Either<X, number>) => {
			return (builder: Builder) => {
				storeEither<X,number>(arg, storeX, (arg: number) => {
					return (builder: Builder) => {
					  let cell1 = beginCell();
					  cell1.storeInt(arg, 22);
					  builder.storeRef(cell1);
					};
				})(builder);
			};
		})(builder);
	    storeEither<X,OneComb<X>>(combArgCellRef.other, storeX, (arg: OneComb<X>) => {
			return (builder: Builder) => {
			  let cell1 = beginCell()
			  storeOneComb<X>(arg, storeX)(cell1);
			  builder.storeRef(cell1);
			};
		})(builder);
	    storeEither<X,X>(combArgCellRef.body, storeX, (arg: X) => {
			return (builder: Builder) => {
			  let cell1 = beginCell()
			  storeX(arg)(cell1);
			  builder.storeRef(cell1);
			};
		})(builder);
	};
}


export type MathExprAsCombArg = {
	kind: 'MathExprAsCombArg';
  n: number;
  ref: BitLenArg;
};
export function loadMathExprAsCombArg(slice: Slice, arg0: number): MathExprAsCombArg {
	let slice1 = slice.loadRef().beginParse();
  let ref: BitLenArg = loadBitLenArg(slice1, arg0 - 2 + 2);
  return {
		kind: 'MathExprAsCombArg',
	  n: (arg0 - 2),
	  ref: ref
	};
}
export function storeMathExprAsCombArg(mathExprAsCombArg: MathExprAsCombArg): (builder: Builder) => void {
	return (builder: Builder) => {
		let cell1 = beginCell();
	  storeBitLenArg(mathExprAsCombArg.ref)(cell1);
	  builder.storeRef(cell1);
	};
}


export type TupleCheck = {
	b: Array<number>
  	kind: 'TupleCheck';
  };
export function loadTupleCheck(slice: Slice): TupleCheck {
	let b: Array<number> = Array.from(Array(2).keys()).map(arg => slice.loadUint(5));
  	return {
  		kind: 'TupleCheck',
		b: b
  	};
  }
export function storeTupleCheck(tupleCheck: TupleCheck): (builder: Builder) => void {
  	return (builder: Builder) => {
		tupleCheck.b.forEach(element => {
			builder.storeUint(element, 5);
		})
  	};
  }

export type ConditionalField = {
	kind: 'ConditionalField';
	a: number;
	b: number | undefined
};
export function loadConditionalField(slice: Slice): ConditionalField {
	let a: number = slice.loadUint(1);
	let b: number | undefined = a ? slice.loadUint(32) : undefined;
	return {
		kind: 'ConditionalField',
		a: a,
		b: b
	};
}
export function storeConditionalField(conditionalField: ConditionalField): (builder: Builder) => void {
	return (builder: Builder) => {
		builder.storeUint(conditionalField.a, 1);
		if (conditionalField.b != undefined) {
			builder.storeUint(conditionalField.b, 32);
		}
	};
}

if (!(flags <= 100)) {
	throw new Error(`Variable flags = ${flags} doesn't follow implicit condition: { flags <= 100 }`)
}


export function loadBoolUser(slice: Slice): BoolUser {
    let a: boolean = slice.loadBoolean();
    return {
        kind: 'BoolUser',
        a: a,
    }

}

export function storeBoolUser(boolUser: BoolUser): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeBit(boolUser.a);
    })

}

export interface BoolUser {
    readonly kind: 'BoolUser';
    readonly a: boolean;
}