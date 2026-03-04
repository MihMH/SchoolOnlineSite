import { useEffect, useState } from "react"
import "./CreateSchoolPage.css"

class Class{
    constructor(Name,TimeTable,Lessons){
        this.Name=Name
        this.TimeTable=TimeTable;
        this.Lessons=Lessons;
    }
}
class Week{
    constructor(days,number){
        this.days=days
        this.number=number
    }
}
class Day{
    constructor(lessons){
        this.lessons=lessons
    }
}
class TLesson{
    constructor(time,number,title,info){
        this.time=time;
        this.number=number;
        this.title=title
        this.info=info;
    }

}
class CLesson{
    constructor(name){
        this.name=name
    }
}
const CreateSchoolPage=()=>{
    const [SchoolName,setSchoolName]=useState("")
    const [ClassArr,setClass]=useState([])
    const [className,setCName]=useState("")
    const [lessonName,setLName]=useState("")
    const [currentClass,setCurrentClass]=useState(null)
    const [weeksArr,setWeeks]=useState([])

    const currentClassObj = ClassArr.find(
        _class => _class.Name === currentClass
    )
    useEffect(()=>{
    if(currentClass!=null){
        console.log("start")
        let clas=ClassArr.find(_class=>_class.Name===currentClass)
        setWeeks(clas.TimeTable)
        console.log(clas.Name)
        console.log("end")

    }
    else{

    }
    },[currentClass])

    const SubmitForm= async()=>{
        console.log(JSON.stringify({ ClassArr, SchoolName }))

        const request=await fetch("http://localhost:3001/createSchool",{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                ClassArr:ClassArr,
                SchoolName:SchoolName
            })
        })
        const data = await request.json();
        if(data.status==="ok"){
            
        }
        else{
            
        }
    }

    const AddLesson=()=>{
        setClass(prevClasses =>
            prevClasses.map(_class =>
            _class.Name === currentClass
                ? { 
                    ..._class,
                    Lessons: [..._class.Lessons, new CLesson(lessonName)]
                  }
                : _class
            )
  )
        
    }
    const DeleteLesson = (Name) => {
        setClass(prevClasses =>
            prevClasses.map(_class =>
              _class.Name === currentClass
                ? {
                    ..._class,
                    Lessons: _class.Lessons.filter(
                      lesson => lesson.name !== Name
                    )
                  }
                : _class
            )
        ) 
}
    const ClassArrAdd=()=>{
        let Days=[]
        for (let i = 0; i < 7; i++) {
            Days.push(new Day([]))
        }
        let Week1=new Week(Days,1)
        let Week2=new Week(Days,2)
        let TimeTable=[Week1,Week2]
        let class1=new Class(className,TimeTable,[])
        setClass(prevClasses=>[...prevClasses,class1])
    }
    const DeleteClass=()=>{
        let newClassArr=ClassArr.map((_class)=>{
            if(_class.Name===currentClass){
                return
            }
            else{
                return _class
            }
        })
        setClass(newClassArr)
    }
    const onSubmitHandler=async(e)=>{
        e.preventDefault()
        let form = new FormData(e.target);
        const weekIndex = parseInt(form.get("WeekSelect")) - 1;
        const dayIndex = parseInt(form.get("DaySelect")) - 1;
        const tlesson = new TLesson(
            form.get("time"),
            parseInt(form.get("number")),
            form.get("LessonSelect"),
            form.get("Info")
        );                
        setClass(prevClasses =>
            prevClasses.map(_class =>{
                if(_class.Name!==currentClass){
                    return _class
                }
                else{
                    let newTimeTable=_class.TimeTable.map((week,wIndex)=>{
                        if(wIndex!=weekIndex){
                            return week
                        }
                        else{
                                return{
                                    ...week,
                                    days:week.days.map((day,dayI)=>{
                                        if(dayI!=dayIndex){
                                            return day
                                        }
                                        else{
                                            return{
                                                ...day,
                                                lessons:[...day.lessons,tlesson]
                                            }
                                        }
                                    })
                                }
                        }
                    })
                    return{
                        ..._class,
                        TimeTable:newTimeTable
                    }
                }
            }

                
            )
        )
        console.log(ClassArr)
    }
    return(
        <div>
            <div>
                <input type="text" onChange={(e)=>setSchoolName(e.target.value)} placeholder="Schools Name"></input>
            </div>
                <div>
                    <select name="classSelect" defaultValue={1} onChange={(e)=>setCurrentClass(e.target.value)}>
                        {
                            ClassArr!=null ? (
                                ClassArr.map((_class)=>{
                                return(
                                    <option value={_class.Name}>{_class.Name}</option>
                                )
                            })
                            ):(
                                <option value={null}>There are no classes yet</option>
                            )
                        }
                    </select>
                    <button type="button" onClick={()=>DeleteClass()}>Delete Class</button>
                </div>
                <div>
                    <input name="className" type="text" onChange={(e)=>setCName(e.target.value)}></input>
                    <button type="button" onClick={()=>ClassArrAdd()}>Create Class</button>
                </div>
                <div>
                    <div className="LessonsContainer">
                        <input onChange={(e)=>setLName(e.target.value)}></input>
                        <button onClick={()=>AddLesson()}>Add Lesson</button>
                        <div>
                            {
                                currentClassObj !=null ? (
                                    currentClassObj.Lessons!=null ? (
                                    currentClassObj.Lessons.map((CLesson)=>{
                                        return(
                                            <div>
                                                <p>{CLesson.name}</p>
                                                <button onClick={()=>DeleteLesson(CLesson.name)}>Delete</button>
                                            </div>
                                        )
                                    })
                                    ):(
                                        <div> </div>
                                    )
                                ):(
                                    <div> </div>
                                )

                            }
                        </div>
                    </div>
                    <div className="TimeTableContainer">
                            <form onSubmit={(e)=>onSubmitHandler(e)}>
                                <select defaultValue={1} name="LessonSelect">
                                    {
                                        currentClassObj!=null ?(
                                        currentClassObj.Lessons!=null ?(
                                        currentClassObj.Lessons.map((CLesson)=>{
                                            return(
                                                <option value={CLesson.name}>{CLesson.name}</option>
                                            )
                                        })
                                        ):(
                                            <option value={null}>There are no classes yet</option>
                                        )
                                        ):(
                                            <option></option>
                                        )

                                    }
                                </select>
                                <select name="WeekSelect">
                                    <option value={1} selected>1</option>
                                    <option value={2}>2</option>
                                </select>
                                <select name="DaySelect">
                                    <option value={1} selected>Monday</option>
                                    <option value={2} selected>Tuesday</option>
                                    <option value={3} selected>Wadnesday</option>
                                    <option value={4} selected>Thursday</option>
                                    <option value={5} selected>Friday</option>
                                    <option value={6} selected>Saturday</option>
                                    <option value={7} selected>Sunday</option>
                                </select>
                                <input name="number" type="number" placeholder="A number of the lesson"></input>
                                <input name="Info" type="text" placeholder="Additional info"></input>
                                <input name="time" type="text" placeholder="time"></input>
                                <button type="Submit"></button>
                            </form>
                    </div>
                </div>
            <button onClick={()=>SubmitForm()}>Create School</button>
        </div>
    )
}
export {CreateSchoolPage}