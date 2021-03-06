/*
    luma.js:        LudoMath's math library
    Author:         Dexter André Osiander
    Last updated:   16.06.2018 (sixteenth of June 2018)
*/



// ########## Numbers ##########
//#region Constants
var DEG2RAD = 0.0174532925199;     // 0.0174532925199
var RAD2DEG = 57.2957795130823;     // 57.2957795130823
var TAU = 6.283185;         // 6.2831853071796
var TAUOVER2 = 3.141593;    // 3.1415926535898
var TAUOVER4 = 1.570796;    // 1.5707963267949
var TAUOVER6 = 1.047198;    // 1.0471975511966
var TAUOVER8 = 0.785398;    // 0.7853981633974
var TAUOVER12 = 0.523599;   // 0.5235987755983
var PI = TAUOVER2;
var PIOVER2 = TAUOVER4;
var PIOVER3 = TAUOVER6;
var PIOVER4 = TAUOVER8;
var PIOVER6 = TAUOVER12;
var E = 2.718282;           // 2.718281828459
var PHI = 1.618034;         // 1.6180339887498948482
var SQRT2 = 1.414214;       // 1.4142135623731
var SQRT3 = 1.732051;       // 1.7320508075689
var SQRT3OVER2 = 0.866025;  // 0.8660254037844
var SQRT2OVER2 = 0.707107;  // 0.7071067811865
var LN2 = 0.693147;         // 0.6931471805599
var LN3 = 1.098612;         // 1.0986122886681

// Indices of refraction
var iof_vacuum = 1.00000;
var iof_air = 1.00029;
var iof_water = 1.333;
var iof_oliveOil = 1.47;
var iof_ice = 1.31;
var iof_windowGlass = 1.52;
var iof_heavyFlintGlass = 1.65;
var iof_sapphire = 1.77;
var iof_diamond = 2.42;
//#endregion

//#region Numeric Functions
function sign(s)
{
    if (s > 0)
    {
        return 1;
    }
    else if (s < 0)
    {
        return -1;
    }
    else 
    {
        return NaN;
    }
}
//#endregion

// ########## Linear Algebra ##########
function flatten (array) 
{
    var tempArr = [];
    for (var i = 0; i < array.length; i++)
    {
        var obj = array[i];
        switch (obj.constructor)
        {
            case Vec2:
            {
                tempArr.push(obj.x, obj.y);
                break;
            }
            case Vec3:
            {
                tempArr.push(obj.x, obj.y, obj.z);
                break;
            }
            case Vec4:
            {   
                tempArr.push(obj.x, obj.y, obj.z, obj.w);
                break;
            }
            default:
            {
                break;
            }
        }
    }
    // array = tempArray;
    array.length = 0;
    Array.prototype.push.apply(array, tempArr);
};

//#region Vec2
function Vec2(x, y) { this.x = (x || 0); this.y = (y || 0); };
// Vector arithmetic
Vec2.prototype.add = function(v) { return new Vec2(this.x + (v.x || 0), this.y + (v.y || 0)); };
Vec2.prototype.addThis = function(v) { this.x += (v.x || 0); this.y += (v.y || 0); };
Vec2.prototype.sub = function(v) { return new Vec2(this.x - (v.x || 0), this.y - (v.y || 0)); };
Vec2.prototype.subThis = function(v) { this.x -= (v.x || 0); this.y -= (v.y || 0); };
Vec2.prototype.mul = function(s) { return new Vec2(this.x * (s || 1), this.y * (s || 1)); };
Vec2.prototype.mulThis = function(s) { this.x *= (s || 1); this.y *= (s || 1); };
Vec2.prototype.div = function(s) { var t = 1.0 / s; return new Vec2(this.x * (t || 1), this.y * (t || 1)); };
Vec2.prototype.divThis = function(s) { var t = 1.0 / s; this.x *= (t || 1); this.y *= (t || 1); };
Vec2.prototype.negation = function() { return new Vec2(this.x * -1, this.y * -1); };
Vec2.prototype.negate = function() { this.x *= -1; this.y *= -1; };
Vec2.prototype.lerp = function(v, t) { return this.add(v.sub(this).mul(t)); };
// Vector operations
Vec2.prototype.dot = function(v) { return this.x * v.x + this.y * v.y; };
Vec2.prototype.mag = function() { return Math.sqrt(this.x * this.x + this.y * this.y); };
Vec2.prototype.magSqr = function() { return this.x * this.x + this.y * this.y; };
Vec2.prototype.angle = function(v) { return Math.acos((this.dot(v)) / (this.mag() * v.mag())); };
Vec2.prototype.angleUnit = function(v) { return Math.acos(this.dot(v)); };
Vec2.prototype.angleDirected = function(v)
{
    // Taken from https://stackoverflow.com/questions/14066933/direct-way-of-computing-clockwise-angle-between-2-vectors
    var dot = this.x * v.x + this.y * v.y;
    var det = this.x * v.y - this.y * v.x;
    var angle = Math.atan2(det, dot);
    // if (angle < 0) angle += TAU; 
    // Comment this out for Vec3 and Vec4 as well!
    return angle;
};
// Is there no angleDirectedUnit version? 
Vec2.prototype.normalization = function() { var mag = this.mag(); return new Vec2(this.x, this.y).div(mag); };
Vec2.prototype.normalize = function() { var mag = 1.0 / this.mag(); this.x *= mag; this.y *= mag; };
// Vector techniques
Vec2.prototype.projection = function(v) { return v.mul(this.dot(v) / v.dot(v)); };
Vec2.prototype.projectionUnit = function(v) { return v.mul(this.dot(v)); };
Vec2.prototype.project = function(v) { var temp = v.mul(this.dot(v) / v.dot(v)); this.x = temp.x; this.y = temp.y; };
Vec2.prototype.projectUnit = function(v) { var temp = v.mul(this.dot(v)); this.x = temp.x; this.y = temp.y; };
Vec2.prototype.rejection = function(v) { return this.sub(this.projection(v)); };
Vec2.prototype.rejectionUnit = function(v) { return this.sub(this.projectionUnit(v)); };
Vec2.prototype.reject = function(v) { var temp = this.sub(v.mul(this.dot(v) / v.dot(v))); this.x = temp.x; this.y = temp.y; };
Vec2.prototype.rejectUnit = function(v) { var temp = this.sub(v.mul(this.dot(v))); this.x = temp.x; this.y = temp.y; };
Vec2.prototype.reflection = function(v) { var u = v.normalization(); return this.sub(u.mul(2 * this.dot(u))); };
Vec2.prototype.reflectionUnit = function(v) { return this.sub(v.mul(2 * this.dot(v))); };
Vec2.prototype.reflect = function(v) { var u = v.normalization(); var temp = this.sub(u.mul(2 * this.dot(u))); this.x = temp.x; this.y = temp.y; };
Vec2.prototype.reflectUnit = function(v) { var temp = this.sub(v.mul(2 * this.dot(v))); this.x = temp.x; this.y = temp.y; };
Vec2.prototype.refraction = function(v, n1, n2) // Returns null if having to reflect
{
    var temp = this;
    var n = n1 / n2;
    var t1 = v.angleDirected(this.negation());              // Directed angle between normal and incident
    
    // If travelling from dense medium to rare medium (e.g. water-to-air)
    if (n > 1)
    {
        var tc = Math.asin(n2 / n1);                        // Critical angle

        // Refract if incident angle is less than or equal to critical angle
        // Have to use non-directed angles because of using Math.asin in tc
        if (this.negation().angle(v) <= tc)
        {
            var t2 = Math.asin(n * Math.sin(t1));           // Directed angle between negated normal and refracted vector
            var t3 = new Vec2(1, 0).angleDirected(v);       // Directed angle between x-axis and normal
            var mag = temp.mag();
            temp = new Vec2(
                Math.cos(t3 + 180 * DEG2RAD + t2),
                Math.sin(t3 + 180 * DEG2RAD + t2));
            temp.mulThis(mag);
            console.log("Dense to rare");
            return temp;
        }
        // Reflect if incident angle is greater than critical angle
        else
        {
            console.log("Had to reflect");
            // return this.reflection(v);
            return null;
        }

    }
    // Else if travelling from rare medium to dense medium (e.g. air-to-water)
    else if (n < 1)
    {
        var t2 = Math.asin(n * Math.sin(t1));               // Directed angle between negated normal and refracted vector
        var t3 = new Vec2(1, 0).angleDirected(v);           // Directed angle between x-axis and normal
        var mag = temp.mag();
        temp = new Vec2(
            Math.cos(t3 + 180 * DEG2RAD + t2),
            Math.sin(t3 + 180 * DEG2RAD + t2));
            temp.mulThis(mag);
            console.log("Rare to dense");
            return temp;
        }
        // Else if travelling between same medii (n == 1) (e.g. air-to-air)
        {
            console.log("No change in medii");
            return this;
        }
};
Vec2.prototype.refractionUnit = function(v, n1, n2)
{
    var temp = this;
    var n = n1 / n2;
    var t1 = this.negation().angleUnit(v);          // Angle between indicent and normal
    // ##### Candidate for simplification
    var signum = new Vec2(1, 0).dot(temp) > 0 ? 1 : -1;
    var t2 = Math.asin(n * Math.sin(t1)) * signum;  // Angle between refractor and negated normal
    var t3 = v.angle(new Vec2(1, 0));               // Angle between x-axis and normal (maybe use directed angle?)
    var mag = temp.mag();
    temp = new Vec2(
        Math.cos(t3 + 180 * DEG2RAD + t2),
        Math.sin(t3 + 180 * DEG2RAD + t2));
    temp.mulThis(mag);
    return new Vec2(temp.x, temp.y);
};
Vec2.prototype.refract = function(v, n1, n2)
{
    var temp = this;
    var n = n1 / n2;
    var t1 = this.negation().angle(v);              // Angle between indicent and normal
    var signum = (Math.cos(temp.angle(new Vec2(1, 0))) > 0 ? 1 : -1);
    var t2 = Math.asin(n * Math.sin(t1)) * signum;  // Angle between refractor and negated normal
    var t3 = v.angle(new Vec2(1, 0));               // Angle between x-axis and normal (maybe use directed angle?)
    var mag = temp.mag();
    temp = new Vec2(
        Math.cos(t3 + 180 * DEG2RAD + t2),
        Math.sin(t3 + 180 * DEG2RAD + t2));
    temp.mulThis(mag);
    this.x = temp.x;
    this.y = temp.y;
};
Vec2.prototype.refractUnit = function(v, n1, n2)
{
    var temp = this;
    var n = n1 / n2;
    var t1 = this.negation().angleUnit(v);          // Angle between indicent and normal
    // ##### Candidate for simplification
    var signum = new Vec2(1, 0).dot(temp) > 0 ? 1 : -1;
    var t2 = Math.asin(n * Math.sin(t1)) * signum;  // Angle between refractor and negated normal
    var t3 = v.angle(new Vec2(1, 0));               // Angle between x-axis and normal (maybe use directed angle?)
    var mag = temp.mag();
    temp = new Vec2(
        Math.cos(t3 + 180 * DEG2RAD + t2),
        Math.sin(t3 + 180 * DEG2RAD + t2));
    temp.mulThis(mag);
    this.x = temp.x;
    this.y = temp.y;
};
// Transformations
Vec2.prototype.rotation = function(s)
{
    // Apply these changes to rotate() as well!
    var temp = this;
    var mag = temp.mag();
    var angle = new Vec2(1, 0).angleDirected(temp);
    var cos = Math.cos(angle + s);
    var sin = Math.sin(angle + s);
    var px = cos * mag;
    var py = sin * mag;
    return new Vec2(px, py);
};
Vec2.prototype.rotate = function(s)
{
    var mag = this.mag();
    var angle = this.angleDirected(new Vec2(1, 0));
    var temp = new Vec2(
        Math.cos(angle + s),
        Math.sin(angle + s)).mul(mag);
    this.x = temp.x;
    this.y = temp.y;
};
//#endregion

//#region Vec3
function Vec3(x, y, z) { this.x = (x || 0); this.y = (y || 0); this.z = (z || 0); };
// Vector arithmetic
Vec3.prototype.add = function(v) { return new Vec3(this.x + (v.x || 0), this.y + (v.y || 0), this.z + (v.z || 0)); };
Vec3.prototype.addThis = function(v) { this.x += (v.x || 0); this.y += (v.y || 0); this.z += (v.z || 0); };
Vec3.prototype.sub = function(v) { return new Vec3(this.x - (v.x || 0), this.y - (v.y || 0), this.z - (v.z || 0)); };
Vec3.prototype.subThis = function(v) { this.x -= (v.x || 0); this.y -= (v.y || 0); this.z -= (v.z || 0); };
Vec3.prototype.mul = function(s) { return new Vec3(this.x * (s || 1), this.y * (s || 1), this.z * (s || 1)); };
Vec3.prototype.mulThis = function(s) { this.x *= (s || 1); this.y *= (s || 1); this.z *= (s || 1); };
Vec3.prototype.div = function(s) { var t = 1.0 / s; return new Vec3(this.x * (t || 1), this.y * (t || 1), this.z * (t || 1)); };
Vec3.prototype.divThis = function(s) { var t = 1.0 / s; this.x *= (t || 1); this.y *= (t || 1); this.z *= (t || 1); };
Vec3.prototype.negation = function() { return new Vec3(this.x * -1, this.y * -1, this.z * -1); };
Vec3.prototype.negate = function() { this.x *= -1; this.y *= -1; this.z *= -1; };
Vec3.prototype.lerp = function(v, t) { return this.add(v.sub(this).mul(t)); };
// Vector operations
Vec3.prototype.dot = function(v) { return this.x * v.x + this.y * v.y + this.z * v.z; };
Vec3.prototype.cross = function(v) { return new Vec3(this.y * v.z - v.y * this.z, this.z * v.x - v.z * this.x, this.x * v.y - v.x * this.y); };
Vec3.prototype.mag = function() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); };
Vec3.prototype.magSqr = function() { return this.x * this.x + this.y * this.y + this.z * this.z; };
Vec3.prototype.angle = function(v) { return Math.acos((this.dot(v)) / (this.mag() * v.mag())); };
Vec3.prototype.angleUnit = function(v) { return Math.acos(this.dot(v)); };
Vec3.prototype.angleDirected = function(v, n)
{
    // Taken from https://stackoverflow.com/questions/5188561/signed-angle-between-two-3d-vectors-with-same-origin-within-the-same-plane
    var angle = this.angle(v);
    var cross = this.cross(v);
    if (n.dot(cross) < 0)
    {
        angle = -angle;
    }
    return angle;
}
Vec3.prototype.normalization = function() { var mag = this.mag(); return new Vec3(this.x, this.y, this.z).div(mag); };
Vec3.prototype.normalize = function() { var mag = 1.0 / this.mag(); this.x *= mag; this.y *= mag; this.z *= mag; };
// Vector techniques
Vec3.prototype.projection = function(v) { return v.mul(this.dot(v) / v.dot(v)); };
Vec3.prototype.projectionUnit = function(v) { return v.mul(this.dot(v)); };
Vec3.prototype.project = function(v) { var temp = v.mul(this.dot(v) / v.dot(v)); this.x = temp.x; this.y = temp.y; this.z = temp.z; };
Vec3.prototype.projectUnit = function(v) { var temp = v.mul(this.dot(v)); this.x = temp.x; this.y = temp.y; this.z = temp.z; };
Vec3.prototype.rejection = function(v) { return this.sub(this.projection(v)); };
Vec3.prototype.rejectionUnit = function(v) { return this.sub(this.projectionUnit(v)); };
Vec3.prototype.reject = function(v) { var temp = this.sub(v.mul(this.dot(v) / v.dot(v))); this.x = temp.x; this.y = temp.y; this.z = temp.z; };
Vec3.prototype.rejectUnit = function(v) { var temp = this.sub(v.mul(this.dot(v))); this.x = temp.x; this.y = temp.y; this.z = temp.z; };
Vec3.prototype.reflection = function(v) { var u = v.normalization(); return this.sub(u.mul(2 * this.dot(u))); };
Vec3.prototype.reflectionUnit = function(v) { return this.sub(v.mul(2 * this.dot(v))); };
Vec3.prototype.reflect = function(v) { var u = v.normalization(); var temp = this.sub(u.mul(2 * this.dot(u))); this.x = temp.x; this.y = temp.y; this.z = temp.z; };
Vec3.prototype.reflectUnit = function(v) { var temp = this.sub(v.mul(2 * this.dot(v))); this.x = temp.x; this.y = temp.y; this.z = temp.z; };
Vec3.prototype.refraction = function(v, n1, n2)
{
    // Have yet to test different normals other than (0, 0, 1)
    var temp = this;
    var mag = temp.mag();
    var n = n1 / n2;
    var t1 = this.negation().angle(v);              // Angle between indicent and normal
    var t2 = Math.asin(n * Math.sin(t1));           // Angle between refractor and negated normal
    var h = this.projection(v).mag();               // Height of triangle
    var di = Math.sin(t1) * this.mag();             // Length of opposite side to t1
    var dr = Math.tan(t2) * h;                      // Length of opposite side to t2
    var t3 = dr / di;                               // Ratio between dr and di. Used as parameter for lerp. 
    temp = v.negation().lerp(temp, t3);
    temp.normalize();
    temp.mulThis(mag);
    return new Vec3(temp.x, temp.y, temp.z);
};
Vec3.prototype.refractionUnit = function(v, n1, n2)
{
    var temp = this;
    var n = n1 / n2;
    var t1 = this.negation().angleUnit(v);          // Angle between indicent and normal
    var t2 = Math.asin(n * Math.sin(t1));           // Angle between refractor and negated normal
    var h = this.projection(v);                     // Height of triangle
    var di = Math.sin(t1);                          // Length of opposite side to t1
    var dr = Math.tan(t2) * h;                      // Length of opposite side to t2
    var t3 = dr / di;                               // Ratio between dr and di. Used as parameter for lerp. 
    temp = v.negation().lerp(temp, t3);
    temp.normalize();
    return new Vec3(temp.x, temp.y, temp.z);
};
Vec3.prototype.refract = function(v, n1, n2)
{
    var temp = this;
    var mag = temp.mag();
    var n = n1 / n2;
    var t1 = this.negation().angle(v);              // Angle between indicent and normal
    var t2 = Math.asin(n * Math.sin(t1));           // Angle between refractor and negated normal
    var h = this.projection(v).mag();               // Height of triangle
    var di = Math.sin(t1) * this.mag();             // Length of opposite side to t1
    var dr = Math.tan(t2) * h;                      // Length of opposite side to t2
    var t3 = dr / di;                               // Ratio between dr and di. Used as parameter for lerp. 
    temp = v.negation().lerp(temp, t3);
    temp.normalize();
    temp.mulThis(mag);
    this.x = temp.x;
    this.y = temp.y;
    this.z = temp.z;
};
Vec3.prototype.refractUnit = function(v, n1, n2)
{
    var temp = this;
    var n = n1 / n2;
    var t1 = this.negation().angleUnit(v);          // Angle between indicent and normal
    var t2 = Math.asin(n * Math.sin(t1));           // Angle between refractor and negated normal
    var h = this.projection(v);                     // Height of triangle
    var di = Math.sin(t1);                          // Length of opposite side to t1
    var dr = Math.tan(t2) * h;                      // Length of opposite side to t2
    var t3 = dr / di;                               // Ratio between dr and di. Used as parameter for lerp. 
    temp = v.negation().lerp(temp, t3);
    temp.normalize();
    this.x = temp.x;
    this.y = temp.y;
    this.z = temp.z;
};
// Transformations
Vec3.prototype.rotation = function(s)
{

};
Vec3.prototype.rotate = function(s)
{

};
//#endregion

//#region Vec4
function Vec4(x, y, z, w) { this.x = (x || 0); this.y = (y || 0); this.z = (z || 0); this.w = (w || 0); };
//#endregion

//#region Mat2
//#endregion

//#region Mat3
//#endregion

//#region Mat4
//#endregion

//#region Mat
//#endregion

//#region Bivec2
//#endregion

//#region Bivec3
//#endregion

//#region Trivec3
//#endregion

// ########## Complex Numbers ##########
//#region Complex
//#endregion

//#region Quat
//#endregion

//#region Quat2
//#endregion

// ########## Geometry ##########
//#region LineSeg
function LineSeg(a, b) { this.a = a; this.b = b; }
LineSeg.prototype.magnitude = function() 
{
    var m = 0; 
    for (var comp in this) 
    { 
        m += Math.pow(comp, 2);
    } 
    return Math.sqrt(m); 
}
LineSeg.prototype.midPoint = function() 
{
    return (this.a.add(this.b.sub(this.a)).mul(0.5));
};
LineSeg.prototype.lerp = function(t) { return this.a.add(this.b.sub(this.a).mul(t)); }
//#endregion
function Line(p, v) { this.p = p; this.v = v; }
//#region Line
//#endregion
//#region Tri
function Tri(a, b, c) { this.a = a; this.b = b; this.c = c; }
Tri.prototype.containsPoint = function(v)
{

};
Tri.prototype.barycentricCoordinate = function(v)
{

};
Tri.prototype.circumCenter = function()
{

};
Tri.prototype.inCircle = function()
{

};
Tri.prototype.circumCircle = function()
{

};
Tri.prototype.counterClockwise = function()
{
    // https://en.wikipedia.org/wiki/Graham_scan#Pseudocode
    var det = this.a.x * this.b.y - this.b.x * this.a.y;
    if (det > 0)
        return true;
    else if (det < 0)
        return false;
    else 
        return null;
};
//#endregion
//#region Circle
function Circle()
{
    // Defined by center and radius
    if (arguments.length == 2)
    {
        this.center = arguments[0];
        this.radius = arguments[1];
    }
    // Defined by three points
    else if (arguments.length == 3)
    {
        // Pseudocode: 
        // Half-way points between two line segments
        var h1 = 0.5 * (arguments[0] + arguments[1]);
        var h2 = 0.5 * (arguments[0] + arguments[2]);

        // Vectors pointing towards circumcenter
        
    }
};
//#endregion
//#region Point
var SortMode = Object.freeze({
    Low: 0, High: 1, Left: 2, Right: 3, 
    PolarCCW: 4, PolarCW: 5,
});
function randomSetPoint(count, min, max)
{
    var tempArr = [];

    // Vec2
    switch (min.constructor)
    {
        case Vec2:
        {
            var domain = new Vec2(max.x - min.x, max.y - min.y);
            for (var i = 0; i < count; i++)
            {
                var A = Math.random();
                var B = Math.random();
                tempArr.push(new Vec2(min.x, min.y).add(new Vec2(domain.x * A, domain.y * B)));
            }
            break;
        }
        case Vec3:
        {
            break;
        }
        case Vec4:
        {
            break;
        }
        default:
        {
            break;
        }
    }
    return tempArr;
};
function sort(P, sortmode)
{
    var tempArr = [];
    Array.prototype.push.apply(tempArr, P);
    var tempPnt;
    
    switch (sortmode)
    {
        case SortMode.Low:
        {
            var i = 0;
            while (i < tempArr.length - 1)
            {
                var y1 = tempArr[i].y;
                var y2 = tempArr[i + 1].y;
                
                if (y2 < y1)
                {
                    tempPnt = tempArr[i];
                    tempArr[i] = tempArr[i + 1];
                    tempArr[i + 1] = tempPnt;
                    i = 0;
                }
                else
                {
                    i++;
                }
            }
            
            break;
        }
        case SortMode.High:
        {
            break;
        }
        case SortMode.Left:
        {
            break;
        }
        case SortMode.Right:
        {
            break;
        }
        case SortMode.PolarCCW:
        {
            // The first element is the one with the lowest y-coordinate
            var lowestIndex = 0;
            for (var i = 0; i < tempArr.length; i++)
            {
                if (tempArr[i].y < tempArr[lowestIndex].y)
                {
                    lowestIndex = i;
                }
            }
            tempPnt = tempArr[0];
            tempArr[0] = tempArr[lowestIndex];
            tempArr[lowestIndex] = tempPnt;
            
            // Measuring the polar counter-clockwise angle between the first point
            var i = 1;
            while (i < P.length - 1)
            {
                var a = tempArr[i].sub(tempArr[0]);
                var b = tempArr[i + 1].sub(tempArr[0]);
                // Doing a simplified cross product and measuring the z-component
                if (a.x * b.y - b.x * a.y < 0)
                {
                    tempPnt = tempArr[i];
                    tempArr[i] = tempArr[i + 1];
                    tempArr[i + 1] = tempPnt;
                    i = 1;
                }
                else
                {
                    i++;
                }
            }
            
            break;
        }
        case SortMode.PolarCW:
        {
            break;
        }
        default:
        {
            break;
        }
    }
    
    P.length = 0;
    Array.prototype.push.apply(P, tempArr);
};
function voronoi(P)
{
    
};
function delaunayTriangulation(P)
{
    
};
function midPoint(P)
{

};
function kMeansClustering(P)
{

};
function connectOrdered(P)
{
    var tempArr = [];
    for (var i = 0; i < P.length - 1; i++)
    {
        tempArr.push(P[i], P[i + 1]);
    }
    tempArr.push(P[P.length - 1], P[0]);
    Array.prototype.push.apply(P, tempArr);
};
function connectAll(P)
{
    var tempArr = [];
    for (var i = 0; i < P.length; i++)
    {
        for (var j = i + 1; j < P.length; j++)
        {
            tempArr.push(P[i], P[j]);
        }
    }
    Array.prototype.push.apply(P, tempArr);
};
function convexHull(P, presorted)
{
    // https://en.wikipedia.org/wiki/Graham_scan#Pseudocode
    if (!presorted)
        sort(P, SortMode.PolarCCW);
    
    var tempArr = [];
    tempArr.push(P[0], P[1], P[2]);
    var i = 3;
    while (i <= P.length)
    {
        var a = i == P.length ? P[0] : P[i];    // Leading vertex
        console.log("a: ", a);   
        tempArr.push(a);                        // Top stack element
        var b = tempArr[tempArr.length - 2];    // Second-top stack element
        console.log("b: ", b);   
        var c = tempArr[tempArr.length - 3];    // Third-top stack element
        console.log("c: ", c);   
        var A = b.sub(c);
        console.log("A: ", A);   
        var B = a.sub(c);
        console.log("B: ", B);

        // If clockwise orientation...
        while ((A.x * B.y - B.x * A.y) <= 0)
        {
            console.log("Swapping...")
            // Replacing previous top-stack element with this element
            tempArr[tempArr.length - 2] = tempArr[tempArr.length - 1];
            console.log("length: ", tempArr.length);
            tempArr.length = tempArr.length - 1;
            console.log("length: ", tempArr.length);
            
            a = tempArr[tempArr.length - 1];
            console.log("a: ", a);   
            tempArr.push(a);
            b = tempArr[tempArr.length - 2];
            console.log("b: ", b);   
            c = tempArr[tempArr.length - 3];
            console.log("c: ", c);   
            A = b.sub(c);
            console.log("A: ", A);   
            B = a.sub(c);
            console.log("B: ", B);   
            if ((A.x * B.y - B.x * A.y) > 0)
            {
                i++;
            }
        }
        // i++;
    }
    console.log(tempArr);

    // Converting array of points into array of lines
    var arr = [];
    arr.push(tempArr[0], tempArr[1]);
    for (var i = 1; i < tempArr.length; i++)
    {
        arr.push(tempArr[i - 1], tempArr[i]);
    }
    arr.push(tempArr[tempArr.length - 1], tempArr[0]);

    Array.prototype.push.apply(P, arr);
};
//#endregion

// ########## Functions ##########
//#region Parsing
//#endregion

//#region Calculus
//#endregion

// ########## Curves ##########
//#region Bézier
//#endregion

// ########## Statistics ##########

// ########## Combinatorics ##########

// ########## Probability ##########

// ########## Series ##########
