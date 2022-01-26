
-------------------------------------------------
GET /washers/[id]
		will returns {
                        id: string,
			name: string,
			photo: srting, // image url
			type: string, // one of [all, shop, delivery]
			isAvailable: bool,
			closeHour: int, // number between 0 to 23
			openHour: int, // number between 0 to 23 
			location: double array, // contains two value for LatLng, ex: [30.111, 16.000],
			workDays: int array, // represent week days where 
								 // 1 = monday, ... friday = 5, saturday = 6, sunday = 7
							     // ex: if washer works on monday and friday then value = [1, 5]
								 
			services: array of object, // returns same as 'POST /washers/[id]/services' bellow
		}

-------------------------------------------------
GET /washers/
		same as pefore but returns array
-------------------------------------------------
POST /washers/
	http request body same as 'GET /washers/[id]' but
	rename id to uid, where uid is the user Id to convert it into washer user
-------------------------------------------------
GET /washers/[id]/services
POST /washers/[id]/services
		use this to create new service for the washer,
		in http request body you should enter = {
			title: string,
			desc: string,
			type: string, // name of the parent category
			duration: int, // duration required for washer to complate this service, in minutes
			order: int, // to order the services in flutter inside the same category 
			enabled: bool, // if FALSE user can't see this service
			price: { mid: 6.0 ,lrg: 9.9, xlg: 14.0 } // price of the service by car size
		}
POST /washers/[id]/services/[service_id]
		use this to change serivce properties
		http request body same as previous request