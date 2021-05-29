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
  Radio
} from 'antd'
const { Title } = Typography
const { Header, Content } = Layout
const { confirm } = Modal
import { ExclamationCircleOutlined } from '@ant-design/icons'
import "../../layout/Layout.css"

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
          console.log(Object.entries(res.data.students))
          Object.entries(res.data.students).map(entry => studentsByID[entry[1].id] = `${entry[1].first_name} ${entry[1].last_name}`)
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
    []
  )

  // Projectlista {[id]: "Name"}

  useEffect(
    () => {
      const getProjects = async () => {
        let projectsByID = {};
        try {
          const res = await axios.get('api/project');
          console.log(Object.entries(res.data.projects))
          Object.entries(res.data.projects).map(entry => projectsByID[entry[1].id] = entry[1].name)
          console.log(projectsByID);
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
    console.log({v})
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
                <Radio.Button value={o}>{o}</Radio.Button>
              )}
            </Radio.Group>
          </Col>
        </Row>
      </Header>
      <Content className="content">
        
        {<ListManagement reloadListTrigger={reloadListTrigger} studentList={studentList} projectList={projectList} listing={listing}/>}

      </Content>
    </Layout>
  )
}

// Managementek listázása
const ListManagement = ({ reloadListTrigger, studentList, projectList, listing }) => {
  const [trigger, setTrigger] = useState()
  const [loader, setLoader] = useState(true)

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
            <List
              bordered
              dataSource={list.data[`${listing}s`]}
              renderItem={item => (
                <List.Item>
                  <Typography.Text strong>
                    {JSON.stringify(item)}
                  </Typography.Text>
                  <Button
                    type="primary"
                    >
                    Save
                  </Button>
                </List.Item>
              )}
            />
            :
            <Empty />
          )}
        </Col>
      </Row>
    </Spin>
  )
}

// Management mentése
export default Management