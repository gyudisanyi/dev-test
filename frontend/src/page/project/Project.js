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

const Project=()=>{
    const [reloadListTrigger, setReloadListTrigger] = useState(null)
    const [showModal, setShowModal] = useState(false)
    // Új projekt hozzáadása gombra kattintás
    const onClickAddNewProject=()=>{
        setShowModal(true)
    }
    const onClickCancel=()=>{
        setShowModal(false)
    }
    const onDone=({name})=>{
        setShowModal(false)
        setReloadListTrigger(new Date().getTime())
        message.success('The following Project has been saved: ' + name)
    }
    return(
        <Layout>
            <Header className="header">
                <Row>
                    <Col span={22}>
                        <Title>Project Handler</Title>
                    </Col>
                    <Col span={2}>
                        <Button 
                            type="primary"
                            onClick={onClickAddNewProject}>
                            Add new Project
                        </Button>
                    </Col>
                </Row>
            </Header>
            <Content className="content">
                <ListProject reloadListTrigger={reloadListTrigger}/>
                <AddProjectModal visible={showModal} onClickCancel={onClickCancel} onDone={onDone}/>
            </Content>
        </Layout>
    )
}

// Projektek listázása
const ListProject =({reloadListTrigger})=>{
    const [trigger, setTrigger] = useState()
    const [loader, setLoader] = useState(true)

    const [list, setList] = useState({
        data: null,
        complete: false,
        error: false
    })
    // Projektek betöltése
    useEffect(
        () => {
            setLoader(true)
            setList({
                data: list.data,
                error: false,
                complete: false
            })
            axios.get('api/project')
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
    // Adott projekt törlésére kattinttás
    const onClickDeleteProject=({name, id})=>{
        confirm({
          title: 'Are you sure delete this Project?',
          icon: <ExclamationCircleOutlined />,
          content: name,
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk() {
            deleteProject({name: name, id: id})
          },
          onCancel() {}
        })
    }
    // Projekt törlése
    const deleteProject=({id, name})=>{
        setLoader(true)
        axios.delete('api/project/' + id )
        .then(res =>{
                message.success('The following Project has been deleted: ' + name)
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
                    list.data.projects.length ?
                    <List
                        bordered
                        dataSource={list.data.projects}
                        renderItem={item => (
                            <List.Item>
                                <Typography.Text strong>
                                    {item.name}
                                </Typography.Text>
                                <Typography.Text>
                                    {item.desc}
                                </Typography.Text>
                                <Button 
                                    type="primary"
                                    onClick={ ({id = item.id, name = item.name }) => onClickDeleteProject({id: id, name: name})}>
                                    Delete
                                </Button>
                            </List.Item>
                        )}
                    />
                    :
                    <Empty/>
                ))}
            </Col>
        </Row>
    </Spin>
    )
}
// Új projekt felvitele
const AddProjectModal=({
    visible,
    onClickCancel,
    onDone
})=>{
    const [form] = Form.useForm()

    const onClickSave=()=>{
        form
        .validateFields()
        .then(values => {
            saveProject({
                name: values.name,
                desc: values.desc
            })
        })
        .catch(info => {
            console.log('Validate Failed:', info)
        })
    }
    // Projekt mentése
    const saveProject = ({name, desc}) => {
        axios.post('api/project',{
            'name': name,
            'desc': desc
        })
        .then(()=>{
            form.resetFields()
            onDone({name: name})
        })
        .catch((err)=>{
            if (err.response.status === 409) {
                setDuplicationErrorMessage({name: err.response.data.error})
            } else {
            }
        })
    }
    const setDuplicationErrorMessage = ({name}) => {
        console.log(name)
        form.setFields([
            {
                name: Object.keys(name)[0],
                errors: ["Alredy exists"]
            }
        ])
    }
    return(
        <Modal
            visible={visible}
            title="Add new Project"
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
                    label={'Project name'}
                    name="name"
                    rules={[{required: true, message: 'Please type Project name!'}]}
                >
                    <Input
                        autoComplete='off'
                        placeholder="Name"/>
                </Form.Item>
                <Form.Item
                    label={'Description'}
                    name="desc"
                    rules={[{required: true, message: 'Please type Project description!'}]}
                >
                    <Input
                        autoComplete='off'
                        placeholder="Description"/>
                </Form.Item>
            </Form>
        </Modal>
    )
}
export default Project