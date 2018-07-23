## Luma Grapher Settings


## Functions
Name | Functionality
- | - 
add(v) | Adds v and <span class="blue">this</span>, and returns a new vector. Analogous to the + operator. 
addThis(v) | Adds v to <span class="blue">this</span>. Analogous to the += operator. 

## Properties of Vector Addition
Returns | Operands | Validity | Cost | Commutative | Associative | Distributive
- | - | - | - | - | - | - 
Vector of same dimension | Binary | Vec2, Vec3, Vec4 | \\((n - 1)^+\\) | <p class="green">true</p> | <p class="green">true</p> | <p class="green">true</p>

## Example (Code)
```
var a = new Vec2(3, 4);
var b = new Vec2(-2, 1);
var c = a.add(b);
console.log("a: ", a);
// Output: "a: Vec2 {x: 3, y: 4}"
console.log("b: ", b);
// Output: "b: Vec2 {x: -2, y: 1}"
console.log("c: ", c);
// Output: "c: Vec2 {x: 1, y: 5}"
a.addThis(b);
console.log("a: ", a);
// Output: "a: Vec2 {x: 1, y: 5}"
```

## Example (Visual)
<p>Given two vectors \\(\overrightarrow{a} = [3, 4]\\) and \\(\overrightarrow{b} = [-2, 1]\\), </p>
<img class="imgCentered" src="/imgs/vectorAdditionVariables.png">
<p>let \\(\overrightarrow{c} = \overrightarrow{a} + \overrightarrow{b}\\), </p>
<img class="imgCentered" src="/imgs/vectorAdditionOperation.png">
<p>then \\(\overrightarrow{c} = [a_x + b_x, a_y + b_y] = [3 + (-2), 4 + 1] = [1, 5]\\).

## Legend
* n: dimension
* <span class="blue">this</span>: this vector
* v: another vector
* Superscripted operator (e.g. \\(2^+\\)): how many of said operation 