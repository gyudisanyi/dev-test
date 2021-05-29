import React, { useState, useEffect } from 'react'
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
  Radio,
  Transfer
} from 'antd'
const { Title } = Typography
const { Header, Content } = Layout
const { confirm } = Modal
import { ExclamationCircleOutlined } from '@ant-design/icons'
import "../../layout/Layout.css"
import { student } from '../../../../backend/src/config/service'

const Management = () => {
  const [reloadListTrigger, setReloadListTrigger] = useState(null)

  // Radio gombrol, hogy mit listazzon

  const listOptions = ['student', 'project']
  const [listing, setListing] = useState(listOptions[0])

  // Studentlistát, projektlistát lehívom és elkészítem [id]: "Firstname Lastname" / [id]: "Name" formátumban.

  const [studentList, setStudentList] = useState({
    data: null,
    complete: false,
    error: false
  })

  const [projectList, setProjectList] = useState({
    data: null,
    complete: false,
    error: false
  })

  // Studentlista {[id]: "Firstname Lastname"}

  useEffect(
    () => {
      const getStudents = async () => {
        let studentsByID = {};
        try {
          const res = await axios.get('api/student');
          Object.entries(res.data.students).map(entry => studentsByID[entry[1].id] = `${entry[1].first_name} ${entry[1].last_name}`)
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
    []
  )

  // Projectlista {[id]: "Name"}

  useEffect(
    () => {
      const getProjects = async () => {
        let projectsByID = {};
        try {
          const res = await axios.get('api/project');
          Object.entries(res.data.projects).map(entry => projectsByID[entry[1].id] = entry[1].name)
          setProjectList({
            data: projectsByID,
            error: false,
            complete: true
          })
        } catch (err) {
          console.log(err)
          setLoader(false)
          setProjectList({
            data: null,
            error: true,
            complete: true
          })
        }
      };
      getProjects();
    },
    []
  )

  const changeListing = (v) => {
    setListing(v)
  }

  return (
    <Layout>
      <Header className="header">
        <Row>
          <Col span={24}>
            <Title>Management Handler</Title>
          </Col>
          <Col span={24}>
            <Radio.Group name="listing" buttonStyle="solid" onChange={(e) => changeListing(e.target.value)} defaultValue={listOptions[0]}>
              {listOptions.map(o => 
                <Radio.Button key={o} value={o}>{o}</Radio.Button>
              )}
            </Radio.Group>
          </Col>
        </Row>
      </Header>
      <Content className="content">
        
        {<ListManagement reloadListTrigger={reloadListTrigger} setReloadListTrigger={setReloadListTrigger} studentList={studentList} projectList={projectList} listing={listing}/>}

      </Content>
    </Layout>
  )
}

// Managementek listázása
const ListManagement = ({ reloadListTrigger, setReloadListTrigger, studentList, projectList, listing }) => {
  const [trigger, setTrigger] = useState()
  const [loader, setLoader] = useState(true)
  
  const [showModal, setShowModal] = useState(false)  
  const [clickId, setClickId] = useState()

  const [list, setList] = useState({
    data: null,
    complete: false,
    error: false
  })

  // List betöltése
  useEffect(
    () => {
      setLoader(true)
      setList({
        data: list.data,
        error: false,
        complete: false
      })
      axios.get('api/'+listing)
        .then(res => {
          setLoader(false)
          setList({
            data: res.data,
            error: false,
            complete: true
          })
        }
        )
        .catch(() => {
          setLoader(false)
          setList({
            data: null,
            error: true,
            complete: true
          })
        }
        )
    },
    [trigger, reloadListTrigger, listing]
  )

  const openEditModal = (id) => {
    setShowModal(true)
    setClickId(id)
    console.log(id, listing)
  }
  const onClickCancel=()=>{
    setShowModal(false)
  }
  const onDone=()=>{
    setShowModal(false)
    console.log("DUNN")
    setReloadListTrigger(new Date().getTime())
    message.success('Association saved')
}

  return (
    <Spin
      size="large"
      spinning={loader}>
      <Row style={{ marginTop: 8, marginBottom: 8 }}>
        <Col span={24}>
          {(list.complete && (
            list.data &&
            list.data[`${listing}s`] &&
            list.data[`${listing}s`].length &&
            studentList.complete &&
            studentList.data &&
            projectList.complete &&
            projectList.data)
            ?
            <>
            <List
              bordered
              dataSource={list.data[`${listing}s`]}
              renderItem={item => (
                <List.Item>
                    <ShowAssociation item={item} listing={listing}/>
                  <Button
                    type="primary"
                    onClick={() => openEditModal(item.id)}
                    >
                    Edit associations
                  </Button>
                </List.Item>
              )}
            />
            { clickId ?
            <EditModal
              visible={showModal}
              onClickCancel={onClickCancel}
              onDone={onDone}
              clickId={clickId}
              studentList={studentList}
              projectList={projectList}
              listing={listing}
              />
              : ''
            }
            </>
            :
            <Empty />
          )}
        </Col>
      </Row>
    </Spin>
  )
}

const ShowAssociation = ({item, listing}) => {
  const name = item.name ? item.name : `${item.first_name} ${item.last_name}`;
  const associate = listing === 'student' ? 'projects' : 'students';
  const [associations, setAssociations] = useState([])

  useEffect(()=>{
    const getAssociations = async (item, listing) =>{
      setAssociations([])
      try {
        const res = await axios.get('api/'+listing+'/manage/' + item.id)
        setAssociations(res.data[associate])
      } catch(error) {
        console.log(error)
      }
    }
    getAssociations(item, listing)

  },[])

  return (
    <>
      <Typography.Text>
        <strong>Name: </strong> {name}
      </Typography.Text>
      <Typography.Text>
        <strong>Associated {associate}: </strong>
        {associations ? 
        associations.map(a => (' ' + (a.name || `${a.first_name} ${a.last_name}`)))
        : ' ---'}
      </Typography.Text>
    </>
  )
}

// Asszociacio szerkesztese

const EditModal =({
  visible,
  onClickCancel,
  onDone,
  clickId,
  listing,
  studentList,
  projectList
}) => {

  // Transferhez

  const dataSource = {students:[], projects: []}
  const [targetKeys, setTargetKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])
  const associate = listing === 'student' ? 'projects' : 'students';
  Object.keys(studentList.data).forEach(k=>dataSource.students.push({"key": k, "name": studentList.data[k]}))
  Object.keys(projectList.data).forEach(k=>dataSource.projects.push({"key": k, "name": projectList.data[k]}))


  const name = listing === 'project' ? projectList.data[clickId] : studentList.data[clickId]

  useEffect(()=>{
    const getAssociationIds = async (clickId, listing) =>{
      setTargetKeys([])
      try {
        const res = await axios.get('api/'+listing+'/manage/' + clickId)
        console.log({res})
        const src = []
        res.data[associate].forEach(i=>src.push(i.id))
        setTargetKeys(src)
      } catch(error) {
        console.log(error)
      }
    }
    getAssociationIds(clickId, listing)

  },[clickId])

  const onChange = (nextTargetKeys, direction, moveKeys) => {
    console.log('targetKeys:', nextTargetKeys);
    console.log('direction:', direction);
    console.log('moveKeys:', moveKeys);
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    console.log('sourceSelectedKeys:', sourceSelectedKeys);
    console.log('targetSelectedKeys:', targetSelectedKeys);
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll = (direction, e) => {
    console.log('direction:', direction);
    console.log('target:', e.target);
  };

  const onClickSave = async (ids) => {
    try {
        saveAssociation({
            ids: targetKeys
        })
    } catch(error) {
      console.log(error)
    }        
  }

  const saveAssociation = async ({ids}) => {
    try {
      await axios.put('api/'+listing+'/manage/'+clickId, {
        'ids': ids,
      })
      onDone()
    } catch(error) {
        console.log(error)
    }
  }

  return (
    <Modal
        visible={visible}
        title={`Associate to ${name}`}
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
        { targetKeys ? 
        <>
        <Transfer 
            dataSource={dataSource[associate]}
            titles={['Not associated', 'Associated']}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={onChange}
            onSelectChange={onSelectChange}
            onScroll={onScroll}
            render={item => item.name}
          />
        </>
           : ''
        }
         

        </Modal>
  )
}


export default Management