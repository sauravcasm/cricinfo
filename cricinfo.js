let fs=require("fs");
let cheerio=require("cheerio");
let request=require("request");
let path=require("path");



// var arr=[];
var count=0;



let url="https://www.espncricinfo.com/";

let allHtml=request("https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results",cb);

function cb(err,res,html){
  if(err)
  {
    console.log(err);
  }
  else{
    completeUrl(html);
  }
}
//creating IPL 2020 folder if doesnt exist
var outer=path.join(__dirname,"IPL-2020");
if(fs.existsSync(outer)==false)
{
  fs.mkdirSync(outer);
}
//1. create ipl2020 folder using mkdirsync
//2. get each match fixture link and request for its html
//3. create team name folder if doesnt exist

function oneMatchcb(err,res,html)
{
  if(err)
  {
    console.log(err);
  }
  else{
    createFolder(html);
  }
}


function createFolder(html)//ek match ka poora html
{
  let selTool=cheerio.load(html);
  var description=selTool(".match-info.match-info-MATCH .description").text();
  var result=selTool(".match-info.match-info-MATCH .status-text").text();
  var info=description.split(",");
  // console.log("date->"+info[2]);
  // console.log("venue->"+info[1]);
  // console.log("result->"+result);

  //console.table(selTool(teamTableArr[0]).html());//html of each batsman table

//approach:
//nhi h toh folder bnao team ka, nhi hai toh file bnao player ka folder k andar, hai toh object push krdo bnake ek match ka
//first team name associated with first batsman table
//i.e. team name at index 0 has team table at index 0 as well
var teamName=selTool(".match-header .team .name-detail");//2 names ,1 of each team of that match
//console.log(selTool(teamName[0]).text());
let teamTableArr=selTool(".table.batsman");//2 batsman table for each game
count++;
console.log(count);
for(let i=0;i<teamName.length;i++)
{
  var FolderForFile=path.join(outer,selTool(teamName[i]).text());
  //console.log(FolderForFile);
  if(fs.existsSync(path.join(outer,selTool(teamName[i]).text()))==false)
  {
    fs.mkdirSync(path.join(outer,selTool(teamName[i]).text()));//ab iss team folder k andar check kro, batsman file exists or not
    console.log(selTool(teamName[i]).text());
  }
  //folder ban gya hoga nhi hoga toh
  //ab check kro, batsman file exists or not

var teamBatsman=selTool(teamTableArr[i]).find("tr");//ith team batsman table,usme batsman name=batsman-cell in table
//many batsman, so it returns an array of their names
for(let j=0;j<teamBatsman.length;j++)//i wale for loop mein hein, which is for one team
{                                     //usme uss team k saare batsman k name aagye
                                      //file create kro if it doesnt exists
var eachBatsmanCol=selTool(teamBatsman[j]).find("td");

if(eachBatsmanCol.length==8)
{
  var playerName=selTool(eachBatsmanCol[0]).text();

  if(fs.existsSync(path.join(FolderForFile,playerName+".json"))==false)//if team folder k andar batsman ki file exist nhi krti
  {//filename along with extension check krna hota h exists or not
    fs.openSync(path.join(FolderForFile,playerName+".json"),"w");
    var arr=[];
    arr.push({
      runs:selTool(eachBatsmanCol[2]).text(),
      balls:selTool(eachBatsmanCol[3]).text(),
      fours:selTool(eachBatsmanCol[4]).text(),
      sixes:selTool(eachBatsmanCol[5]).text(),
      strike_rate:selTool(eachBatsmanCol[6]).text(),
      date:info[2],
      venue:info[1],
      result:result,
      opponent:i==0?selTool(teamName[1]).text():selTool(teamName[0]).text()
    })
    
    let contentInFile=JSON.stringify(arr);
    //console.log("content after->"+contentInFile);
    fs.writeFileSync(path.join(FolderForFile,playerName+".json"),contentInFile);
    //console.table(content);
  }
  else
  {
  //exists or not we need to push data to json file
  let content=fs.readFileSync(path.join(FolderForFile,playerName+".json"));
  let arr=JSON.parse(content);
  //console.log("content before->"+content)
  arr.push({
    runs:selTool(eachBatsmanCol[2]).text(),
    balls:selTool(eachBatsmanCol[3]).text(),
    fours:selTool(eachBatsmanCol[4]).text(),
    sixes:selTool(eachBatsmanCol[5]).text(),
    strike_rate:selTool(eachBatsmanCol[6]).text(),
    date:info[2],
      venue:info[1],
      result:result,
      opponent:i==0?selTool(teamName[1]).text():selTool(teamName[0]).text()
  })

  let contentInFile=JSON.stringify(arr);
  //console.log("content after->"+contentInFile);
  fs.writeFileSync(path.join(FolderForFile,playerName+".json"),contentInFile);
  

  }
  
  //console.table(selTool(teamName[i]).text()+"-->"+playerName+"-->"+content);
  //console.log(playerName);
}


}
//console.log(batsmanName.length);



// for(let i=0;i<batsmanName.length;i++)
// {
// if(fs.existsSync(path.join(FolderForFile,selTool(batsmanName[i]).text())==false))
// {//jis folder mein file bnani hai usme exist nhi krti file toh bnado
//   fs.open(path.join(FolderForFile,selTool(batsmanName[i]).text()),"w");
// }
// }


// for(let i=0;i<batsmanName.length;i++)
// console.log(selTool(batsmanName[i]).text());
}



}

function completeUrl(html)
{
  let selTool=cheerio.load(html);
  let cardsAnchor=selTool(".match-info-link-FIXTURES");//60 anchor tags of all matches
  console.log(cardsAnchor.length);
  for(let i=0;i<cardsAnchor.length;i++)//all links are in href of anchor tag
  {
    var completeUrl=url+selTool(cardsAnchor[i]).attr("href");
    //console.log(completeUrl);
    var oneMatchhtml=request(completeUrl,oneMatchcb);//calling match url for each match





  //console.log(cardsAnchor.length);
  }
}