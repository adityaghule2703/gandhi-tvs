import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, MenuItem } from '@mui/material'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faFileExcel, faFilePdf, faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { CSVLink } from 'react-csv'
 import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { getDefaultSearchFields, useTableFilter } from './tableFilters'
import { usePagination } from './pagination.jsx'
import { copyToClipboard, exportToCsv, exportToExcel, exportToPdf } from './tableExports'
import { confirmDelete, showError, showSuccess } from './sweetAlerts'
import axiosInstance from '../axiosInstance.js'

export {
  React,
  useState,
  useEffect,
  Link,
  Menu,
  MenuItem,
  SearchOutlinedIcon,
  FontAwesomeIcon,
  faCopy,
  faFileExcel,
  faFilePdf,
  faFileCsv,
  CSVLink,
  FaCheckCircle,
   FaTimesCircle,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  copyToClipboard,
  exportToCsv,
  exportToExcel,
  exportToPdf,
  confirmDelete,
  showError,
  showSuccess,
  axiosInstance,
}
