const StudentModel = ({
    sequelize, 
    DataType
  }) => {
  const {INTEGER, STRING, DATE, NOW} = DataType
  const Student = sequelize.define("student", {
    id: {
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
    first_name: {
      type: STRING,
      allowNull: false
    },
    last_name: {
      type: STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: STRING,
      unique: true,
      allowNull: false
    },
    createdAt: {
      type: DATE,
      defaultValue: NOW
    }
  }, )
  return Student;
}
  
export default StudentModel