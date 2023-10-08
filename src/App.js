import React, { useState, useEffect } from "react";
import CSVReader from "react-csv-reader";
import { firestore } from "./config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore/lite";
import { Table, Button, Modal, Form, Input, Spin } from "antd";
import "./App.css";


function App() {
  const collectionRef = collection(firestore, "students");

  const [studentData, setStudentData] = useState([]);
  const [snapShotStudent, setSnapShotsStudent] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fetchDataFromFirestore = async () => {
    try {
      const querySnapshot = await getDocs(collectionRef);
      const students = [];

      querySnapshot.forEach((doc) => {
        students.push({ ...doc.data(), id: doc.id });
      });

      setSnapShotsStudent(students);
    } catch (error) {
      console.error("Error fetching data from Firestore: ", error);
    }
  };

  const handleCSVUpload = async (data) => {
    setLoading(true);
    if (data.length > 0) {
      const headers = data[0];
      const studentObjects = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const student = {};

        for (let j = 0; j < headers.length; j++) {
          student[headers[j]] = row[j];
        }

        studentObjects.push(student);
      }

      setStudentData(studentObjects);

      try {
        const promises = studentObjects.map((object) =>
          addDoc(collectionRef, object)
        );
        await Promise.all(promises);
        console.log("Documents uploaded successfully");
      } catch (error) {
        console.error("Error adding documents: ", error);
      } finally {
        setLoading(false);
        fetchDataFromFirestore();
      }
    }
  };

  useEffect(() => {
    fetchDataFromFirestore();
  }, []);

  const handleEdit = (student) => {
    setEditingStudent(student);
    form.setFieldsValue(student);
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const docRef = doc(collectionRef, editingStudent.id);
      await updateDoc(docRef, values);

      setIsModalVisible(false);
      fetchDataFromFirestore();
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const studentDocRef = doc(collectionRef, id);
      await deleteDoc(studentDocRef);
      fetchDataFromFirestore();
    } catch (error) {
      console.error("Error deleting document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      width: "150",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      width: "150",
    },
    {
      title: "Roll No",
      dataIndex: "Roll",
      key: "Roll",
      width: "150",
    },
    {
      title: "Belong",
      dataIndex: "belong",
      key: "belong",
      width: "150",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      width: "150",
      render: (_, student) => (
        <div>
          <Button type="primary" onClick={() => handleEdit(student)}>
            Edit
          </Button>{" "}
          <Button type="danger" onClick={() => handleDelete(student.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="app-container">
      <h1 className="app-title">CSV Data App</h1>

      <div className="csv-upload-section">
        <h2 className="section-title">Upload CSV</h2>
        <CSVReader
          onFileLoaded={handleCSVUpload}
          parserOptions={{ skipEmptyLines: true }}
          className="csv-reader"
        />
      </div>
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" tip="Uploading..." />
        </div>
      ) : (
        <div style={{ padding: "50px" }}>
          <Table dataSource={snapShotStudent} columns={columns} />
        </div>
      )}

      <Modal
        title="Edit Student"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="update"
            type="primary"
            onClick={() => {
              form
                .validateFields()
                .then((values) => {
                  handleUpdate(values);
                  form.resetFields();
                })
                .catch((errorInfo) => {
                  console.error("Validation failed:", errorInfo);
                });
            }}
          >
            Update
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="Name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="belong"
            label="belong"
            rules={[{ required: true, message: "Please enter the Belongs" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
