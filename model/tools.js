var md5 = require('md5');

var tools = {
    md5(val){
        return md5(val);
    },
    tagList(json){
        let tags = [];
        let orgKeys = ['id','title','status','keywords','description','content','prevPage']
        Object.keys(json).forEach(function(key,i,v){
            if( orgKeys.indexOf(key) == -1 ) {
                tags.push(key);
            }
        });
        return tags;
    },
    getTime(){
        return new Date();
    },
    /*
    [
        {
            year: 2018,
            list:[]
        },
        {
            year: 2017,
            list:[]
        },
        {
            year: 2016,
            list:[]
        }
    ]
    */
    cateToYearList(objs){
        let yearList = []
        let curYear = 0;
        objs.forEach(obj=>{
            let objYear = obj.add_time.getFullYear();
            if( objYear != curYear ) {
                yearList.push({
                    year: objYear,
                    list:[obj]
                });
            } else {
                yearList[yearList.length-1].list.push(obj)
            }
            curYear = objYear;
        });
        return yearList;
    }
}

module.exports = tools