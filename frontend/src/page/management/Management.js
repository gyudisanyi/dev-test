import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { 
    Layout, 
    Row, 
    Col, 
    Spin, 
    Empty, 
    List, 
    Typography, 
    Button, 
    Modal, 
    message,
    Form, 
    Input } from 'antd'
const { Title } = Typography
const { Header, Content } = Layout
const { confirm } = Modal
import { ExclamationCircleOutlined } from '@ant-design/icons'
import "../../layout/Layout.css"

const Management=()=>{
    const [reloadListTrigger, setReloadListTrigger] = useState(null)
    const [showModal, setShowModal] = useState(false)
    // Új management hozzáadása gombra kattintás
    const onClickAddNewManagement=()=>{
        setShowModal(true)
    }
    const onClickCancel=()=>{
        setShowModal(false)
    }
    const onDone=({name})=>{
        setShowModal(false)
        setReloadListTrigger(new Date().getTime())
        message.success('The following Management has been saved: ' + name)
    }
    return(
        <Layout>
            <Header className="header">
                <Row>
                    <Col span={22}>
                        <Title>Management Handler</Title>
                    </Col>
                    <Col span={2}>
                        <Button 
                            type="primary"
                            onClick={onClickAddNewManagement}>
                            Add new Management
                        </Button>
                    </Col>
                </Row>
            </Header>
            <Content className="content">
                <ListManagement reloadListTrigger={reloadListTrigger}/>
                <AddManagementModal visible={showModal} onClickCancel={onClickCancel} onDone={onDone}/>
            </Content>
        </Layout>
    )
}

// Managementek listázása
const ListManagement =({reloadListTrigger})=>{
    const [trigger, setTrigger] = useState()
    const [loader, setLoader] = useState(true)

    const [list, setList] = useState({
        data: null,
        complete: false,
        error: false
    })

    const [studentList, setStudentList] = useState({
      data: null,
      complete: false,
      error: false
    })
    // Managementek betöltése
    useEffect(
        () => {
            setLoader(true)
            setList({
                data: list.data,
                error: false,
                complete: false
            })
            axios.get('api/management')
            .then(res => {
                    setLoader(false)
                    setList({
                        data: res.data,
                        error: false,
                        complete: true
                    })
                }
            )
            .catch(() =>{
                    setLoader(false)
                    setList({
                        data: null,
                        error: true,
                        complete: true
                    })
                }
            )
        },
        [trigger, reloadListTrigger]
    )

    useEffect(
      () => {
        const getStudents = async () => {
          let studentsByID = {};
        try {
          const res = await axios.get('api/student');
          Object.keys(res.data).map(k => studentsById[k] = res.data[k].first_name + res.data[k].last_name)
          console.log(studentsByID);
          setStudentList({
            data: studentsByID,
            error: false,
            complete: true
          })
        } catch (err) {
          console.log(err)
          setLoader(false)
          setStudentList({
            data: null,
            error: true,
            complete: true
          })
        }
      };
      getStudents();
      },
      [trigger, reloadListTrigger]
    )
    // Adott management törlésére kattinttás
    const onClickDeleteManagement=({name, id})=>{
        confirm({
          title: 'Are you sure delete this Management?',
          icon: <ExclamationCircleOutlined />,
          content: name,
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk() {
            deleteManagement({name: name, id: id})
          },
          onCancel() {}
        })
    }
    // Management törlése
    const deleteManagement=({id, name})=>{
        setLoader(true)
        axios.delete('api/management/' + id )
        .then(res =>{
                message.success('The following Management has been deleted: ' + name)
                setLoader(false)
                setTrigger(new Date().getTime())
            }
        )
        .catch(() =>
            setLoader(false)
        )
    }
    return(                
    <Spin
        size="large"
        spinning={loader}>
        <Row style={{ marginTop: 8, marginBottom: 8 }}>
            <Col span={24}>
                {(list.complete && (
                    list.data &&
                    list.data.managements.length &&
                    studentList.complete &&
                    studentList.data &&
                    studentList.data.length)
                    ?
                    <List
                        bordered
                        dataSource={list.data.managements}
                        renderItem={item => (
                            <List.Item>
                                <Typography.Text strong>
                                    {JSON.parse("["+`${item.student_ids}`+"]").map(id=>studentList.data[id])}
                                </Typography.Text>
                                <Typography.Text>
                                    {item.project_ids}
                                </Typography.Text>
                                <Button 
                                    type="primary"
                                    onClick={ ({id = item.id, name = item.name }) => onClickDeleteManagement({id: id, name: name})}>
                                    Delete
                                </Button>
                            </List.Item>
                        )}
                    />
                    :
                    <Empty/>
                )}
            </Col>
        </Row>
    </Spin>
    )
}
// Új management felvitele
const AddManagementModal=({
    visible,
    onClickCancel,
    onDone
})=>{
    const [form] = Form.useForm()

    const onClickSave=()=>{
        form
        .validateFields()
        .then(values => {
            saveManagement({
                student_ids: values.student_ids,
                project_ids: values.project_ids
            })
        })
        .catch(info => {
            console.log('Validate Failed:', info)
        })
    }
    // Management mentése
    const saveManagement = ({student_ids, project_ids}) => {
        axios.post('api/management',{
            'student_ids': student_ids,
            'project_ids': project_ids
        })
        .then(()=>{
            form.resetFields()
            onDone({name: "done"})
        })
        .catch((err)=>{
            if (err.response.status === 409) {
                setDuplicationErrorMessage({name: err.response.data.error})
            } else {
            }
        })
    }

    return(
        <Modal
            visible={visible}
            title="Add new Management"
            onCancel={onClickCancel}
            footer={[
                <Button key="cancel" onClick={onClickCancel}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={onClickSave}>
                    Save
                </Button>
            ]}
            >
            <Form
                form={form}
                layout="vertical"
                >
                <Form.Item
                    label={'Student IDs'}
                    name="student_ids"
                    rules={[{required: true, message: 'Please tick assigned students!'}]}
                >
                    <Input
                        autoComplete='off'
                        placeholder="Name"/>
                </Form.Item>
                <Form.Item
                    label={'Project IDs'}
                    name="project_ids"
                    rules={[{required: true, message: 'Please tick assigned projects!'}]}
                >
                    <Input
                        autoComplete='off'
                        placeholder="Description"/>
                </Form.Item>
            </Form>
        </Modal>
    )
}
export default Management