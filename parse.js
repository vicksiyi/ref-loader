'use strict';

const startMark = '@ref('
const endMark = ')'

module.exports = parse;

/**
 * Function to parse the source code.
 * It extract and replace the path where wrapped in @startMark to @endMark
 * 
 * In function variables explanation
 * ret: A string buffer of results
 * pos: Cursor of the source code, it indicate where are we parsing now.
 * prestr: slice(pos, k), maybe an empty string
 * ref: slice(u, v), can't be an empty string
 * 
 * ..@ref(xxx)...........@ref(./avatar.png).....
 *            ↑          ↑    ↑           ↑↑
 *            pos        k    u           v↑
 *            ↓                            ↑
 *             → → → → → → → → → → → → → → ↑
 * 
 * @param {string} src The source code
 * @param {function} pred It's a predicate function and called while each ref path extracted
 * @throws {Error} Occur when source code has invalid syntax 
 */
/**
 * 这个过程通过正则编写则更加复杂
 * example:
 * const replaceRegex = /@ref\(([^)]+)\)/g;
 * function parse(src, pred) {
 *  return src.replace(replaceRegex, (match, p1) => pred(p1));
 * }
 * 
 * note:
 * 上面这个没有对替换的函数进行格式化
 *
 * 存在下面问题：
 * 1. 格式化问题
 * 2. 括号未闭合报错问题[正则处理起来比较麻烦]
 */
function parse(src, pred) {
  let ret = '\"\"', pos = 0;
  while (pos < src.length) {
    const k = src.indexOf(startMark, pos);
    if (k === -1) {
      break;
    }
    const prestr = src.slice(pos, k);
    if (prestr.length > 0) {
      ret += ' + ' + JSON.stringify(src.slice(pos, k));
    }
    const u = k + startMark.length;
    const v = src.indexOf(endMark, u)
    if (v === -1) {
      throw new Error(`@ref should close with ')'`)
    }
    const ref = src.slice(u, v);
    if (ref.length === 0) {
      throw new Error('@ref path should not be empty')
    }
    ret += ' + ' + pred(ref);
    pos = v + 1;
  }
  if (pos < src.length) {
    ret += ' + ' + JSON.stringify(src.slice(pos, src.length));
  }
  return ret;
}


// const str = `... @ref() ... @ref(./c.png) A`; // Should throw an Error
// const ret = parse(str, ref => {
//   console.log(ref);
//   //return `require("${ref}")`;
// });
// console.log(ret);