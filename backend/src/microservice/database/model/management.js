const ManagementModel = ({
    sequelize, 
    DataType
  }) => {
  const {INTEGER, STRING, DATE, NOW} = DataType
  const Management = sequelize.define("management", {
    id: {
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
    student_ids: {
      type: STRING,
      allowNull: true
    },
    project_ids: {
      type: STRING,
      allowNull: true
    }
  })
  return Management;
}
  
export default ManagementModel