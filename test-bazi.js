var STEMS=[{char:'甲',element:'木',yinYang:'阳'},{char:'乙',element:'木',yinYang:'阴'},{char:'丙',element:'火',yinYang:'阳'},{char:'丁',element:'火',yinYang:'阴'},{char:'戊',element:'土',yinYang:'阳'},{char:'己',element:'土',yinYang:'阴'},{char:'庚',element:'金',yinYang:'阳'},{char:'辛',element:'金',yinYang:'阴'},{char:'壬',element:'水',yinYang:'阳'},{char:'癸',element:'水',yinYang:'阴'}];
var BRANCHES=[{char:'子',element:'水',animal:'鼠'},{char:'丑',element:'土',animal:'牛'},{char:'寅',element:'木',animal:'虎'},{char:'卯',element:'木',animal:'兔'},{char:'辰',element:'土',animal:'龙'},{char:'巳',element:'火',animal:'蛇'},{char:'午',element:'火',animal:'马'},{char:'未',element:'土',animal:'羊'},{char:'申',element:'金',animal:'猴'},{char:'酉',element:'金',animal:'鸡'},{char:'戌',element:'土',animal:'狗'},{char:'亥',element:'水',animal:'猪'}];
var STEM_CHARS='甲乙丙丁戊己庚辛壬癸';
var BRANCH_CHARS='子丑寅卯辰巳午未申酉戌亥';
var NAYIN=['海中金','炉中火','大林木','路旁土','剑锋金','山头火','涧下水','城头土','白蜡金','杨柳木','泉中水','屋上土','霹雳火','松柏木','长流水','沙中金','山下火','平地木','壁上土','金箔金','覆灯火','天河水','大驿土','钗钏金','桑柘木','大溪水','沙中土','天上火','石榴木','大海水'];

function getStemIndex(c){return STEM_CHARS.indexOf(c);}
function getBranchIndex(c){return BRANCH_CHARS.indexOf(c);}
function getYearPillar(year){var si=(year-4)%10;var bi=(year-4)%12;if(si<0)si+=10;if(bi<0)bi+=12;return {stem:STEMS[si],branch:BRANCHES[bi]};}
function getDayPillar(year,month,day){var base=new Date(1900,0,1);var target=new Date(year,month-1,day);var diff=Math.round((target-base)/86400000);var si=((diff%10)+10)%10;var bi=((diff%12)+12)%12;return {stem:STEMS[si],branch:BRANCHES[bi]};}
function getMonthPillar(year,month){var ys=getYearPillar(year).stem.char;var ysi=STEM_CHARS.indexOf(ys);var janStem=(ysi*2+2)%10;var msi=(janStem+month-1)%10;var mbi=(2+month-1)%12;return {stem:STEMS[msi],branch:BRANCHES[mbi]};}
function getHourPillar(dayStem,hourBranchIndex){var dsi=STEM_CHARS.indexOf(dayStem.char);var hsi=(dsi%5*2+hourBranchIndex)%10;return {stem:STEMS[hsi],branch:BRANCHES[hourBranchIndex]};}
function getNayin(si,bi){var pi=(si%10)*6+Math.floor(bi/2);var idx=Math.floor(pi/2)%30;return NAYIN[idx];}

var yr=getYearPillar(2006);
console.log('Year:', JSON.stringify(yr.stem.char+yr.branch.char));
var dp=getDayPillar(2006,5,17);
console.log('Day:', JSON.stringify(dp.stem.char+dp.branch.char));
var mp=getMonthPillar(2006,5);
console.log('Month:', JSON.stringify(mp.stem.char+mp.branch.char));
var hp=getHourPillar(dp.stem,6);
console.log('Hour:', JSON.stringify(hp.stem.char+hp.branch.char));
