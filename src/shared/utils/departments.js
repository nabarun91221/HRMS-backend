export const DEPARTMENTS = Object.freeze({
    "human resources": "HR",
    "finance": "FIN",
    "accounts": "ACC",
    "operations": "OPS",
    "information technology": "IT",
    "development": "DEV",
    "quality Assurance": "QA",
    "security": "SEC",
    "marketing": "MKT",
    "sales": "SLS",
    "customer support": "CS",
    "public relations": "PR",
    "administration": "ADM",
    "research and development": "RND",
    "project management": "PM",
    "ui/ux design": "UIUX",
    "business development": "BD",
    "legal department": "LEGAL",
    "procurement": "PROC",
    "logistics": "LOG"
});
class Department
{
    constructor()
    {
        this.departments = DEPARTMENTS;
    }
    GetDepartment = (DepString) =>
    {
        const shortForm = this.departments[DepString.toLowerCase()] || null;
        return shortForm;
    }
}

export default new Department();