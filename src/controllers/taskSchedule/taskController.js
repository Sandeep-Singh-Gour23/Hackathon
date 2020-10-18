const Task = require("../../models/homepage/task");
const User = require("../../models/user/userModel");

const Createtask = async (req,res)=>{
    let data  = req.body;
         console.log(data)
        
        let task_added = await Task.query().skipUndefined().insert(data).returning("*");
          if(!task_added) return res.send("task not Added");
    
        return res.send("User task Added successfully");
 };

 const GetTaskInfo = async (req, res) => {

    let id = req.params.id;
    console.log("user id is ", id);
    let  result = await User.query().where("id", id)
        .withGraphFetched(
          "tasks(Select)"
        )
        .modifiers({
          Select(builder) {
            builder.select("takedate", "taskname");
          }
          
        })
        .throwIfNotFound();
       if (!result) {
       return res.send ("unable to get result");
       }
      return res.send(result);
    
  };
  
  const Updatestatus = async(req,res)=>{

    let {userid,taskname,status} = req.body;
    console.log(userid);
    console.log(taskname);
    console.log(status);

    let updated_user = await Task.query().skipUndefined().update(status).where("userid",userid).andWhere("taskname",taskname);

    if(!updated_user) return res.send("Task status not updated");

    return res.send("Task status Updated Successfully");
}




 module.exports = { Createtask, GetTaskInfo, Updatestatus};