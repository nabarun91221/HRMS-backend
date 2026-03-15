import Department from "./departments.js"
const autoGenerateCode = (department) =>
{
    const depString = department.toString();
    let shortForm = Department.GetDepartment(depString);
    if (shortForm == null) {
        shortForm = depString
            .replace(/[^a-zA-Z ]/g, "")
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
    }
    const code = shortForm.concat(Math.floor(100 + Math.random() * 900))
    return code;
}

export default autoGenerateCode;