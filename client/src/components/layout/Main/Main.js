import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import './main.css'
import SelectCarPage from '../../pages/SelectCarPage'
import SelectSeatPage from '../../pages/SelectSeatPage'
// import { Layout, theme } from 'antd';
// import { Content } from 'antd/es/layout/layout';

export default function Main() {
	return (
		<body>
			<div className='page-container'>
				<Header></Header>
				<div className='content-wrap'>
					<div>
					</div>
				</div>
				<Footer></Footer>
			</div>
		</body>
	)
}