import Image from 'next/image'
import {
  format,
  formatDistance,
  formatDistanceToNow,
  formatDuration,
  subHours,
  getUnixTime,
} from 'date-fns'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../firebase/firebase'
import { deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore'
import { useState } from 'react'
import { getTime } from 'date-fns'
import { Modal } from '@nextui-org/react'
import { Text, Button, Input } from '@nextui-org/react'
import { timeBetween, totalTime } from '../DashboardInfo'

export interface day {
  days: [
    {
      email: string
      endDate: any
      id: string
      image: string
      name: string
      startDate: any
      timestamp: any
      uid: string
      total: number
    }
  ]
}

const Table = ({ days }: day) => {
  console.log(days)
  const [user] = useAuthState(auth)
  const [newStartDate, setNewStartDate] = useState<any>()
  const [newEndDate, setNewEndDate] = useState<any>()

  const handleDelete = async (id: string) => {
    const docRef = doc(db, 'days', id)
    await deleteDoc(docRef)
  }

  const handleEdit = async (id: string) => {
    const docRef = doc(db, 'days', id)
    const name = user?.displayName
    const image = user?.photoURL
    const email = user?.email
    const uid = user?.uid
    const time = timeBetween(newStartDate, newEndDate)
    const total = totalTime(time)

    const payload = {
      startDate: newStartDate,
      endDate: newEndDate,
      name,
      image,
      email,
      uid,
      total,
    }
    setDoc(docRef, payload)
  }

  const formatDate = (date: string | number | Date) => {
    return format(new Date(date), 'MM-dd-yyyy h:mm a')
  }

  const [visible, setVisible] = useState<boolean>(false)
  const handler = () => setVisible(true)
  const closeHandler = () => {
    setVisible(false)
    console.log('closed')
  }

  const closeAndUpdate = (id: string) => {
    handleEdit(id)
    closeHandler()
    console.log('closed')
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>

                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {days.map((day) => (
                  <tr key={day.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Image
                            className="h-10 w-10 rounded-full"
                            src={day && day.image}
                            height={50}
                            width={50}
                            alt="employee image"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {day.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {day.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {/* // convert firestore timestamp to time and date */}
                        {`${formatDate(day.startDate.toDate())} -
                        ${formatDate(day.endDate.toDate())}`}
                      </div>
                      <div>
                        {`For ${formatDistance(
                          day.startDate.toDate(),
                          day.endDate.toDate()
                        )}`}
                      </div>
                      <div>
                        {`In ${formatDistanceToNow(day.startDate.toDate())}`}
                      </div>
                      {/* <div>{() => timeOff(distance)}</div> */}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        onClick={handler}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer px-3"
                      >
                        Edit
                      </a>
                      <Modal
                        closeButton
                        preventClose
                        aria-labelledby="modal-title"
                        open={visible}
                        onClose={closeHandler}
                      >
                        <Modal.Header>
                          <Text id="modal-title" size={18}>
                            Edit your Time
                          </Text>
                        </Modal.Header>
                        <Modal.Body>
                          <label htmlFor="start Date">New Start Date</label>
                          <input
                            type="datetime-local"
                            placeholder="start date"
                            onChange={(e) =>
                              setNewStartDate(
                                Timestamp.fromDate(new Date(e.target.value))
                              )
                            }
                          />
                          <label htmlFor="end date">New End Date</label>
                          <input
                            type="datetime-local"
                            placeholder="start date"
                            onChange={(e) =>
                              setNewEndDate(
                                Timestamp.fromDate(new Date(e.target.value))
                              )
                            }
                          />
                        </Modal.Body>
                        <Modal.Footer>
                          <Button
                            auto
                            flat
                            color="error"
                            onClick={closeHandler}
                          >
                            Close
                          </Button>
                          <Button auto onClick={() => closeAndUpdate(day.id)}>
                            Submit
                          </Button>
                        </Modal.Footer>
                      </Modal>
                      <a
                        onClick={() => handleDelete(day.id)}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        Delete
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Table
