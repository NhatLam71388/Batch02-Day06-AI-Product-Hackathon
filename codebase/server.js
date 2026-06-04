/**
 * TripEscape AI - Express Server & Gemini API Gateway
 * Developed by ColorOfDreams
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database (Same as client-side fallback, processed on server)
const mockDatabase = {
    routes: [
        {
            id: 'catba',
            name: 'Cung Cát Bà — Vịnh Đảo Trải Nghiệm',
            vibe: 'Phù hợp để khám phá vịnh biển tuyệt đẹp, kết hợp chạy xe cung ven biển Cát Bà kì vĩ và leo núi quốc gia.',
            distance: '150 km (Gồm phà)',
            cost: '~2.5 triệu / người',
            fatigue: '3/5',
            reason: 'Đáp ứng mong muốn đi xe của bạn, đảo Cát Bà có cung đường biển ngoạn mục, nhiều hải sản tươi ngon và các bãi tắm chill.',
            type: 'discovery'
        },
        {
            id: 'haitien',
            name: 'Cung Hải Tiến — Biển Vắng Thanh Bình',
            vibe: 'Biển hoang sơ, bờ cát dài 12km thoải, thích hợp nghỉ dưỡng, ăn hải sản trực tiếp tại thuyền chài giá rẻ.',
            distance: '160 km',
            cost: '~1.8 triệu / người',
            fatigue: '2/5',
            reason: 'Tối ưu cho ngân sách vừa phải, quãng đường chạy xe êm, không gian yên bình đúng chất trốn khỏi ồn ào.',
            type: 'relaxed'
        },
        {
            id: 'coto',
            name: 'Cung Cô Tô — Đảo Xa Hoang Sơ',
            vibe: 'Cát trắng tinh, nước biển xanh ngắt như ngọc, trải nghiệm cuộc sống biển đảo hoang sơ tuyệt đối.',
            distance: '240 km (Gồm tàu cao tốc)',
            cost: '~3.2 triệu / người',
            fatigue: '4/5',
            reason: 'Dành cho chuyến phiêu lưu thực thụ. Đi xa hơn nhưng cảnh sắc Cô Tô hoang sơ vượt trội các bãi tắm đất liền.',
            type: 'adventure'
        }
    ],
    itineraries: {
        'catba': {
            routeId: 'catba',
            routeName: 'Cung Cát Bà — Vịnh Đảo Trải Nghiệm',
            fatigue: 3,
            fatigueDesc: 'Di chuyển bằng ô tô hoặc xe máy, có qua phà Gót hoặc đi cáp treo. Đi lại nhịp độ vừa phải.',
            totalCost: '2.450.000đ',
            costs: { transport: '600.000đ', hotel: '850.000đ', food: '750.000đ', activities: '250.000đ' },
            verifyAlerts: [
                { title: 'Tình trạng phà Gót', text: 'Phà Gót thường tắc dài vào cuối tuần hè. Nên đi cáp treo sang đảo rồi thuê xe máy, hoặc đi phà sáng sớm trước 7h.', link: 'https://www.google.com/maps/search/Ph%C3%A0+G%C3%B3t' },
                { title: 'Đặt phòng tại Cát Bà', text: 'Mùa cao điểm phòng nghỉ Cát Bà cháy rất nhanh. Hãy đặt trước ít nhất 1 tuần.', link: 'https://www.booking.com' }
            ],
            days: {
                1: [
                    { time: '07:30', title: 'Xuất phát từ Hà Nội / Hưng Yên', desc: 'Chạy xe theo hướng QL5B đi Hải Phòng. Cung đường rộng rãi, chạy êm. Nếu đi xe máy đi đường QL5 cũ.', cost: '150.000đ (Xăng)', loc: 'Cao tốc Hà Nội - Hải Phòng', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Cao+tốc+Hà+Nội+-+Hải+Phòng' },
                    { time: '10:00', title: 'Đến Bến Phà Gót - Di chuyển sang Đảo', desc: 'Mua vé phà sang đảo Cát Bà. Tranh thủ check-in ngắm biển từ trên phà.', cost: '30.000đ (Vé phà)', loc: 'Bến phà Gót', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Bến+phà+Gót+Hải+Phòng+giá+vé' },
                    { time: '12:00', title: 'Nhận phòng & Ăn trưa hải sản', desc: 'Đến thị trấn Cát Bà nhận homestay. Thưởng thức bữa trưa với bún hải sản đặc sản tại chợ Cát Bà.', cost: '120.000đ', loc: 'Chợ Cát Bà', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Chợ+Cát+Bà+hải+sản+giá+cả' },
                    { time: '15:00', title: 'Tắm biển Cát Cò 3 & Đi đường ven núi', desc: 'Tắm biển tại bãi Cát Cò 3 nước trong xanh. Sau đó đi bộ men theo con đường vách đá nối liền bãi Cát Cò 1 và 3 cực đẹp.', cost: 'Miễn phí', loc: 'Bãi tắm Cát Cò 3', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Bãi+tắm+Cát+Cò+3+Cát+Bà+đánh+giá' },
                    { time: '19:00', title: 'Ăn tối hải sản bên bờ vịnh', desc: 'Thưởng thức hàu nướng mỡ hành, ghẹ hấp tại nhà hàng bè nổi hoặc quán bình dân ven đường 1/4.', cost: '350.000đ', loc: 'Đường ven biển 1/4', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Đường+1/4+Cát+Bà+quán+ăn+đánh+giá' }
                ],
                2: [
                    { time: '08:00', title: 'Khám phá Vịnh Lan Hạ bằng tàu gỗ', desc: 'Xuất phát từ bến Bèo, đi tàu gỗ thăm vịnh Lan Hạ hoang sơ, chèo thuyền kayak qua Hang Sáng Hang Tối.', cost: '350.000đ (Vé + Kayak)', loc: 'Bến Bèo - Vịnh Lan Hạ', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Bến+Bèo+Vịnh+Lan+Hạ+tour+giá+vé' },
                    { time: '12:00', title: 'Ăn trưa trên bè nổi Lan Hạ', desc: 'Ăn cá song hấp, mực xào sả ớt tươi rói được nuôi trực tiếp tại bè nổi của ngư dân.', cost: '200.000đ', loc: 'Bè nổi Vịnh Lan Hạ', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Nhà+hàng+bè+nổi+Vịnh+Lan+Hạ+đánh+giá' },
                    { time: '15:30', title: 'Chinh phục Đỉnh Ngự Lâm - Rừng Quốc Gia', desc: 'Chạy xe máy cung xuyên đảo tuyệt đẹp lên Vườn quốc gia Cát Bà. Trekking nhẹ lên đỉnh Ngự Lâm ngắm toàn cảnh rừng núi trùng điệp.', cost: '40.000đ (Vé vào cổng)', loc: 'Vườn quốc gia Cát Bà', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Vườn+quốc+gia+Cát+Bà+đỉnh+Ngự+Lâm+giá+vé' },
                    { time: '19:30', title: 'Ăn tối lẩu cua đồng hải sản & Cafe phố cổ', desc: 'Ăn tối lẩu nóng hổi, sau đó dạo phố đi bộ Cát Bà, uống nước dừa dầm ngắm vịnh đêm.', cost: '200.000đ', loc: 'Thị trấn Cát Bà', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Nhà+hàng+lẩu+cua+đồng+Cát+Bà+đánh+giá' }
                ],
                3: [
                    { time: '08:30', title: 'Tham quan Pháo đài Thần Công', desc: 'Lên đỉnh cao nhất Cát Bà, tham quan di tích lịch sử và ngắm toàn cảnh Vịnh Lan Hạ từ trên kính viễn vọng.', cost: '40.000đ', loc: 'Pháo đài Thần Công', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Pháo+đài+Thần+Công+Cát+Bà+đánh+giá' },
                    { time: '11:00', title: 'Mua sắm đặc sản làm quà & Check-out', desc: 'Ghé chợ hải sản mua mực khô, chả mực hoặc nước mắm Cát Hải làm quà cho gia đình. Trả phòng homestay.', cost: '300.000đ', loc: 'Chợ hải sản Cát Bà', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Chợ+Cát+Bà+mua+đặc+sản+quà' },
                    { time: '13:00', title: 'Ăn trưa nhẹ & Trở về đất liền', desc: 'Di chuyển ra phà trở về Hải Phòng. Chạy xe thong thả dọc quốc lộ về lại Hà Nội / Hưng Yên.', cost: '150.000đ', loc: 'Bến phà Cái Viềng', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Bến+phà+Cái+Viềng+giá+vé' }
                ]
            }
        },
        'haitien': {
            routeId: 'haitien',
            routeName: 'Cung Hải Tiến — Biển Vắng Thanh Bình',
            fatigue: 2,
            fatigueDesc: 'Đường đi bằng phẳng dọc theo QL1A hoặc đường ven biển mới. Nhịp độ chậm rãi, thư giãn nghỉ mát.',
            totalCost: '1.750.000đ',
            costs: { transport: '400.000đ', hotel: '650.000đ', food: '500.000đ', activities: '200.000đ' },
            verifyAlerts: [
                { title: 'Dịch vụ bãi biển', text: 'Hải Tiến còn hoang sơ nên ít hoạt động vui chơi giải trí đêm. Thích hợp cho người muốn nghỉ ngơi yên tĩnh.', link: 'https://www.google.com/maps/search/Bi%E1%BB%83n+H%E1%BA%A3i+Ti%E1%BA%BFn' }
            ],
            days: {
                1: [
                    { time: '08:00', title: 'Xuất phát từ Hà Nội / Hưng Yên đi Thanh Hoá', desc: 'Chạy xe dọc QL1A hoặc cao tốc (nếu đi ô tô), qua Ninh Bình rồi rẽ đi biển Hải Tiến (Hoằng Hoá).', cost: '120.000đ', loc: 'Đường QL1A', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Quốc+lộ+1A' },
                    { time: '11:30', title: 'Đến Hải Tiến - Check-in & Ăn trưa', desc: 'Nhận phòng khách sạn ven biển. Ăn trưa cơm bình dân hải sản gần bãi tắm.', cost: '100.000đ', loc: 'Khu du lịch sinh thái Hải Tiến', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Biển+Hải+Tiến+Thanh+Hóa+khách+sạn+ăn+uống' },
                    { time: '15:30', title: 'Tắm biển Hải Tiến & Check-in Cầu Cảng', desc: 'Tắm biển trên bãi cát mịn, check-in Cầu cảng Hải Tiến thiết kế phong cách Châu Âu lãng mạn.', cost: '30.000đ', loc: 'Cầu cảng Hải Tiến', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Cầu+cảng+Hải+Tiến+đánh+giá+giá+vé' },
                    { time: '19:00', title: 'Ăn tối tiệc nướng hải sản bãi biển', desc: 'Ăn ngao hấp, tôm nướng ngọt lịm bên tiếng sóng vỗ.', cost: '250.000đ', loc: 'Bãi biển Hải Tiến', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Quán+ăn+ngon+bờ+biển+Hải+Tiến+đánh+giá' }
                ],
                2: [
                    { time: '05:00', title: 'Đón bình minh & Mua hải sản ở Chợ nổi', desc: 'Thức dậy sớm đón mặt trời mọc, ngắm thuyền chài cập bến bán hải sản tươi sống giá gốc.', cost: 'Miễn phí', loc: 'Bờ biển Hoằng Hoá', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Bờ+biển+Hoằng+Hóa+đón+bình+minh' },
                    { time: '08:30', title: 'Khám phá Đền thờ Trạng Quỳnh & Chùa Hồi Long', desc: 'Di chuyển tham quan văn hoá tâm linh vùng đất cổ Hoằng Hoá.', cost: '20.000đ', loc: 'Đền thờ Trạng Quỳnh', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Đền+thờ+Trạng+Quỳnh+Thanh+Hóa+đánh+giá' },
                    { time: '12:00', title: 'Trưa ăn ghẹ luộc tại homestay', desc: 'Nhờ homestay chế biến mẻ ghẹ tươi rói vừa mua ở bến phà/chợ chài buổi sáng.', cost: '150.000đ', loc: 'Homestay Hải Tiến', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Homestay+Hải+Tiến+Thanh+Hóa+đánh+giá' },
                    { time: '16:00', title: 'Chinh phục Đỉnh Eureka Linh Trường', desc: 'Chạy xe lên đỉnh núi Linh Trường ngắm toàn cảnh rừng thông xanh mướt và dải bờ biển vòng cung Hải Tiến tuyệt mỹ.', cost: 'Miễn phí', loc: 'Núi Linh Trường', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Núi+Linh+Trường+Thanh+Hóa+đường+đi+đánh+giá' },
                    { time: '19:30', title: 'Ăn tối mực nhảy, bề bề rang muối & dạo biển đêm', desc: 'Ăn tối hải sản ngon bổ rẻ rồi đi dạo dọc bờ biển lộng gió cát mịn màng.', cost: '200.000đ', loc: 'Bờ biển đêm Hải Tiến', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Nhà+hàng+hải+sản+Hải+Tiến+Thanh+Hóa+đánh+giá' }
                ],
                3: [
                    { time: '09:00', title: 'Thư giãn uống cafe ngắm sóng biển', desc: 'Ngồi quán cafe view trực diện biển ngắm tàu bè, gió mát rượi.', cost: '40.000đ', loc: 'Quán Cafe Ven Biển', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Quán+cafe+view+biển+Hải+Tiến+đánh+giá' },
                    { time: '11:00', title: 'Mua nem chua Thanh Hoá & Check-out', desc: 'Mua nem chua chính gốc, mực khô làm quà. Làm thủ tục trả phòng.', cost: '200.000đ', loc: 'Quầy bán nem chua đặc sản', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Mua+nem+chua+Thanh+Hóa+chính+gốc+giá+bán' },
                    { time: '13:00', title: 'Ăn trưa nhẹ & Khởi hành về nhà', desc: 'Chạy xe thong thả về lại Hà Nội / Hưng Yên kết thúc chuyến đi trốn.', cost: '100.000đ', loc: 'Quốc lộ 1A', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Đường+về+Hà+Nội' }
                ]
            }
        },
        'coto': {
            routeId: 'coto',
            routeName: 'Cung Cô Tô — Đảo Xa Hoang Sơ',
            fatigue: 4,
            fatigueDesc: 'Cần di chuyển xe dài đến cảng Cái Rồng (Quảng Ninh) rồi đi tàu cao tốc 1.5 tiếng ra đảo Cô Tô. Trực quan mệt hơn.',
            totalCost: '3.150.000đ',
            costs: { transport: '950.000đ', hotel: '900.000đ', food: '900.000đ', activities: '400.000đ' },
            verifyAlerts: [
                { title: 'Tàu cao tốc Cô Tô', text: 'Thời tiết xấu/biển động tàu cao tốc sẽ ngừng chạy. Kiểm tra kĩ dự báo thời tiết trước khi đi.', link: 'https://www.google.com/maps/search/C%E1%BA%A3ng+C%C3%A1i+R%E1%BB%93ng' }
            ],
            days: {
                1: [
                    { time: '06:00', title: 'Xuất phát từ Hà Nội / Hưng Yên đi Cái Rồng', desc: 'Chạy dọc QL5B/QL18 hướng Quảng Ninh tới bến cảng Vân Đồn. Quãng đường khá dài cần vững tay lái.', cost: '250.000đ', loc: 'Cảng Cái Rồng', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Cảng+Cái+Rồng+Vân+Đồn+Quảng+Ninh' },
                    { time: '11:00', title: 'Lên tàu cao tốc ra đảo Cô Tô', desc: 'Trải nghiệm lướt sóng biển vịnh Bái Tử Long kỳ vĩ tiến ra khơi xa.', cost: '250.000đ (Vé tàu)', loc: 'Tàu cao tốc Cô Tô', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Vé+tàu+cao+tốc+Cô+Tô+Cái+Rồng+giá+vé' },
                    { time: '12:30', title: 'Check-in homestay & Ăn trưa cơm đảo', desc: 'Nhận phòng homestay gỗ xinh xắn. Thưởng thức bữa trưa hải sản tươi tại trung tâm thị trấn Cô Tô.', cost: '120.000đ', loc: 'Thị trấn Cô Tô', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Thị+trấn+Cô+Tô+quán+ăn+đánh+giá' },
                    { time: '15:00', title: 'Tắm biển Bãi Hồng Vàn hoang sơ', desc: 'Tắm biển tại bãi tắm lặng sóng, cát trắng phau và nước trong vắt tận đáy.', cost: 'Miễn phí', loc: 'Bãi tắm Hồng Vàn', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Bãi+tắm+Hồng+Vàn+Cô+Tô+đánh+giá' },
                    { time: '19:00', title: 'Tiệc nướng BBQ bãi biển lãng mạn', desc: 'Set up tiệc nướng hải sản ngay trên bờ cát mịn ngắm hoàng hôn đỏ lịm.', cost: '400.000đ', loc: 'Bãi biển Hồng Vàn', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Tiệc+BBQ+bãi+biển+Hồng+Vàn+Cô+Tô+đánh+giá+giá+cả' }
                ],
                2: [
                    { time: '05:30', title: 'Đón bình minh tại Bãi đá Móng Rồng', desc: 'Nơi đón bình minh đẹp nhất Cô Tô với những rạn đá trầm tích kỳ vĩ nhô ra biển sóng đập tung bọt.', cost: 'Miễn phí', loc: 'Bãi đá Móng Rồng (Cầu Mỵ)', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Bãi+đá+Móng+Rồng+Cô+Tô+đầu+Cầu+Mỵ+đánh+giá' },
                    { time: '08:30', title: 'Lên Hải đăng Cô Tô ngắm đảo xanh', desc: 'Trekking leo đồi lên trạm Hải đăng cổ kính, thu trọn tầm mắt đảo Cô Tô trong xanh.', cost: '20.000đ (Xe ôm)', loc: 'Hải đăng Cô Tô', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Hải+đăng+Cô+Tô+đánh+giá+đường+đi' },
                    { time: '11:30', title: 'Ăn trưa bún sứa hải sản độc đáo', desc: 'Trải nghiệm ẩm thực sứa đảo giòn sần sật cực lạ miệng.', cost: '80.000đ', loc: 'Chợ trung tâm Cô Tô', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Chợ+Cô+Tô+quán+bún+sứa+đánh+giá' },
                    { time: '14:30', title: 'Đi đò khám phá Đảo Cô Tô Con', desc: 'Thuê đò gỗ đi 15 phút sang đảo Cô Tô Con - thiên đường không người ở, bãi cát cực kỳ hoang dã.', cost: '150.000đ', loc: 'Cảng Bắc Vàn - Cô Tô Con', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Đò+sang+đảo+Cô+Tô+Con+giá+vé' },
                    { time: '19:30', title: 'Ăn tối lẩu hải sản & Cafe phố bộ', desc: 'Thưởng thức ốc móng tay, mực ống hấp rồi nhâm nhi cafe tại phố đi bộ.', cost: '250.000đ', loc: 'Phố đi bộ Cô Tô', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Phố+đi+bộ+Cô+Tô+nhà+hàng+lẩu+đánh+giá' }
                ],
                3: [
                    { time: '08:30', title: 'Tản bộ Con đường Tình Yêu & Mua quà', desc: 'Dạo bộ dưới hàng thông rì rào thơ mộng. Ghé chợ mua mực một nắng, sá sùng làm quà.', cost: '300.000đ', loc: 'Con đường Tình Yêu Cô Tô', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Con+đường+Tình+Yêu+Cô+Tô+đánh+giá' },
                    { time: '11:00', title: 'Trả phòng & Di chuyển về cảng', desc: 'Lên tàu cao tốc rời đảo về lại Cái Rồng. Ăn trưa nhẹ tại Vân Đồn.', cost: '250.000đ (Vé tàu)', loc: 'Cầu cảng Cô Tô', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Cầu+cảng+Cô+Tô+vé+tàu+về+Cái+Rồng' },
                    { time: '13:30', title: 'Khởi hành chạy xe về Hà Nội / Hưng Yên', desc: 'Thong thả lái xe về lại nhà. Kết thúc chuyến đi đầy trải nghiệm.', cost: '200.000đ', loc: 'Đường cao tốc Hạ Long - Hải Phòng', verifyLink: 'https://www.google.com/maps/search/?api=1&query=Cao+tốc+Hạ+Long+Hải+Phòng' }
                ]
            }
        }
    }
};

// Check if Gemini API Key is available
function getGeminiClient() {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === '' || key === 'your_key_here') {
        return null;
    }
    return new GoogleGenerativeAI(key);
}

// Helper to parse JSON from AI response
function parseJSON(text) {
    let clean = text.trim();
    
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    const lastBrace = clean.lastIndexOf('}');
    const lastBracket = clean.lastIndexOf(']');
    
    let startIdx = -1;
    let endIdx = -1;
    
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        endIdx = lastBrace;
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
        endIdx = lastBracket;
    }
    
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        clean = clean.substring(startIdx, endIdx + 1);
    }
    
    return JSON.parse(clean);
}

// ------------------------------------------
// API ENDPOINTS
// ------------------------------------------

// Endpoint: Check API Status/Mode
app.get('/api/status', (req, res) => {
    const ai = getGeminiClient();
    const hasOpenRouter = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '';
    const hasTavily = process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY.trim() !== '';
    const hasWeather = process.env.WEATHER_API_KEY && process.env.WEATHER_API_KEY.trim() !== '';
    
    res.json({
        live: ai !== null || hasOpenRouter,
        geminiActive: ai !== null,
        openRouterActive: hasOpenRouter,
        tavilyActive: hasTavily,
        weatherActive: hasWeather,
        message: (ai || hasOpenRouter) ? 'Live AI Engine Active' : 'Demo Mode (Mocking) Active'
    });
});

// Endpoint 1: Recommend Routes
app.post('/api/recommend-routes', async (req, res) => {
    const { origin, destination, vehicle, budget, mood, endurance, density, custom, model: clientModel } = req.body;
    const ai = getGeminiClient();
    const openRouterActive = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '';

    if (!ai && !openRouterActive) {
        const filteredRoutes = getMockRoutes(destination, budget, endurance);
        return res.json({ live: false, routes: filteredRoutes });
    }

    try {
        const modelName = clientModel || "gemini-2.5-flash";
        
        let searchContext = "";
        try {
            if (destination) {
                const tavilyData = await searchDestinationPlaces(destination);
                if (tavilyData) {
                    searchContext = `\nDưới đây là dữ liệu thực tế tìm kiếm trực tiếp trên internet về địa điểm tại ${destination}:\n${tavilyData}\n`;
                }
            }
        } catch (e) {
            console.warn("Tavily search skipped:", e.message);
        }

        const prompt = `Bạn là trợ lý ảo TripEscape AI chuyên nghiệp.
Hãy phân tích các thông số chuyến đi của người dùng dưới đây và đề xuất đúng 3 cung đường du lịch hoặc trải nghiệm tại điểm đến được yêu cầu phù hợp nhất.
- Điểm xuất phát: ${origin}
- Điểm đến mong muốn: ${destination || 'Bất kỳ bãi biển nào phù hợp'}
- Phương tiện di chuyển: ${vehicle}
- Ngân sách: ${budget}
- Phong cách du lịch: ${mood}
- Khả năng chịu mệt: ${endurance}
- Độ đông đúc: ${density}
- Yêu cầu đặc biệt khác: ${custom || 'Không có'}
${searchContext}
Hãy chỉ trả về dữ liệu định dạng JSON hợp lệ tuân thủ chính xác cấu trúc mảng dưới đây. KHÔNG ghi thêm bất kỳ chữ nào ngoài mã JSON.
[
  {
    "id": "chuỗi viết liền không dấu, ví dụ: catba, haitien, coto",
    "name": "Tên cung đường hấp dẫn, ví dụ: Cung Cát Bà — Vịnh Đảo Trải Nghiệm",
    "vibe": "Mô tả không khí/vibe cung đường ngắn gọn trong 2 câu",
    "distance": "Khoảng cách số km ví dụ: 150 km",
    "cost": "Ngân sách ước tính ví dụ: ~2.5 triệu / người",
    "fatigue": "Chỉ số mệt mỏi từ 1/5 đến 5/5 ví dụ: 3/5",
    "reason": "Giải thích vì sao cung đường này cực kì phù hợp với các thông số người dùng đã chọn ở trên trong 2 câu.",
    "type": "discovery hoặc relaxed hoặc adventure"
  }
]`;

        const text = await generateContentWithFallback(ai, modelName, prompt);
        const routes = parseJSON(text);

        res.json({ live: true, routes });
    } catch (err) {
        console.error('API Error in recommend-routes:', err);
        const filteredRoutes = getMockRoutes(destination, budget, endurance);
        res.json({ live: false, routes: filteredRoutes, error: err.message });
    }
});

// Endpoint 2: Generate Itinerary
app.post('/api/generate-itinerary', async (req, res) => {
    const { route, origin, destination, vehicle, budget, mood, endurance, model: clientModel } = req.body;
    const ai = getGeminiClient();
    const openRouterActive = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '';

    if (!ai && !openRouterActive) {
        const data = getMockItinerary(route.id, destination);
        data.weatherForecast = getMockWeatherForecast(route.id);
        return res.json({ live: false, itinerary: data });
    }

    try {
        const modelName = clientModel || "gemini-2.5-flash";

        let weatherForecast = null;
        let searchContext = "";
        try {
            const queryDest = destination || (route && route.name) || "";
            if (queryDest) {
                const [weather, search] = await Promise.all([
                    fetchDestinationWeather(queryDest),
                    searchDestinationPlaces(queryDest)
                ]);
                weatherForecast = weather;
                if (search) {
                    searchContext = `\nDưới đây là dữ liệu thực tế tìm kiếm trực tiếp trên internet về các địa danh/ẩm thực tại ${queryDest}:\n${search}\n`;
                }
            }
        } catch (e) {
            console.warn("Parallel Tavily / Weather API fetch skipped:", e.message);
        }

        let weatherSummaryText = "";
        if (weatherForecast && weatherForecast.length >= 3) {
            weatherSummaryText = `\nDự báo thời tiết 3 ngày sắp tới tại điểm đến:\n` + 
                weatherForecast.map(w => `- Ngày ${w.day}: ${w.text}, nhiệt độ ${w.temp}°C${w.willItRain ? ' (có khả năng mưa)' : ''}`).join('\n') + '\n';
        }

        const prompt = `Bạn là trợ lý ảo TripEscape AI chuyên nghiệp. Hãy tạo một lịch trình chi tiết 3 ngày 2 đêm đi du lịch dành cho người dùng dựa trên thông số sau:
- Cung đường chọn: ${route.name}
- Điểm xuất phát: ${origin}
- Điểm đến mong muốn: ${destination || 'Điểm đến trong cung đường'}
- Phương tiện: ${vehicle}
- Ngân sách tổng quan: ${route.cost}
- Phong cách mong muốn: ${mood}
- Mức độ mệt mỏi: ${endurance}
${weatherSummaryText}
${searchContext}

QUY TẮC BẮT BUỘC ĐỂ ĐẢM BẢO ĐỘ CHÍNH XÁC VÀ XÁC THỰC:
1. THỜI GIAN DI CHUYỂN THỰC TẾ (GOOGLE MAPS):
   Khi thiết kế thời gian di chuyển từ điểm xuất phát (Hà Nội/Hưng Yên) tới điểm đến ở hoạt động đầu tiên của Ngày 1, bạn BẮT BUỘC phải sử dụng thời gian di chuyển thực tế chính xác:
   - Từ Hà Nội đi Cát Bà: Ô tô đi cao tốc QL5B hết khoảng 2.5 - 3 tiếng (đã gồm thời gian qua phà Gót hoặc đi cáp treo). Xe máy đi QL5 cũ hết khoảng 3.5 - 4 tiếng.
   - Từ Hà Nội đi Hải Tiến: Ô tô đi cao tốc hết khoảng 2.5 tiếng. Xe máy đi QL1A hết khoảng 3 - 3.5 tiếng.
   - Từ Hà Nội đi Cô Tô: Ô tô/Xe máy đến Cảng Cái Rồng (Vân Đồn) hết khoảng 3.5 - 4.5 tiếng, sau đó đi tàu cao tốc ra đảo Cô Tô hết 1 - 1.5 tiếng. Tổng thời gian di chuyển khoảng 5 - 6 tiếng.
   - Với các hành trình khác: Hãy ước tính thời gian thực tế trên Google Maps dựa trên khoảng cách km thực tế và tốc độ trung bình của phương tiện đã chọn.

2. LỰA CHỌN CHỖ NGHỈ (KHÁCH SẠN/HOMESTAY) CỤ THỂ:
   Không được ghi chung chung "nhận homestay/khách sạn". Bạn phải chọn ra ĐÚNG DUY NHẤT một tên khách sạn hoặc homestay cụ thể có mức giá phù hợp với ngân sách của người dùng từ kết quả tìm kiếm Tavily (nằm trong RAG context ở trên). Ghi rõ tên chỗ nghỉ, địa chỉ cụ thể và mức giá phòng dự tính trong mô tả hoạt động nhận phòng ở Ngày 1.

3. LIÊN KẾT XÁC THỰC THỰC TẾ (VERIFY LINK):
   - Mỗi hoạt động chi tiết trong các ngày (đặc biệt là chỗ nghỉ, quán ăn, giá vé tham quan) BẮT BUỘC phải có trường "verifyLink".
   - Bạn PHẢI trích xuất chính xác các đường dẫn (URL) từ kết quả tìm kiếm internet thực tế (RAG context bên trên) cho hoạt động tương ứng để làm link xác thực (ví dụ: các bài báo du lịch, blog review, website đặt phòng, website chính thức).
   - Chỉ khi hoạt động/địa danh đó KHÔNG có bài báo hay website nào đề cập cụ thể trong kết quả tìm kiếm RAG ở trên, bạn mới được tạo đường dẫn Google Maps Search cụ thể dạng: https://www.google.com/maps/search/?api=1&query=tên+địa+điểm+kèm+địa+danh. Không được ghi bừa là đã xác thực nếu không cung cấp đúng nguồn tin cậy.

Hãy trả về duy nhất một đối tượng JSON khớp chính xác cấu trúc sau. KHÔNG ghi thêm bất kỳ văn bản nào trước hoặc sau mã JSON:
{
  "routeId": "${route.id}",
  "routeName": "${route.name}",
  "fatigue": 3, 
  "fatigueDesc": "Mô tả ngắn về mức độ thể lực tiêu tốn trong chuyến đi",
  "totalCost": "Ví dụ: 2.450.000đ",
  "costs": {
    "transport": "Chi phí di chuyển dự tính ví dụ: 600.000đ",
    "hotel": "Chi phí khách sạn dự tính ví dụ: 800.000đ",
    "food": "Chi phí ăn uống dự tính ví dụ: 700.000đ",
    "activities": "Chi phí vé chơi ví dụ: 350.000đ"
  },
  "verifyAlerts": [
    {
      "title": "Tên điểm cần tự kiểm chứng, ví dụ: Vé tàu cao tốc Cô Tô",
      "text": "Mô tả rủi ro hoặc điểm lưu ý thực tế cần xác minh trước khi đi",
      "link": "Đường dẫn bài viết xác thực hoặc Google search link ví dụ: https://www.google.com/search?q=vé+tàu+cô+tô"
    }
  ],
  "days": {
    "1": [
      {
        "time": "Giờ hoạt động ví dụ: 08:30",
        "title": "Tên hoạt động ngắn gọn hấp dẫn",
        "desc": "Chi tiết trải nghiệm của hoạt động, tên chỗ nghỉ, gợi ý món ăn hoặc đường đi cụ thể và chi phí",
        "cost": "Chi phí riêng của hoạt động này ví dụ: 150.000đ hoặc Miễn phí",
        "loc": "Tên địa điểm cụ thể để tìm trên bản đồ ví dụ: Cầu cảng Hải Tiến",
        "verifyLink": "Đường dẫn bài viết review/booking thực tế trích từ RAG hoặc Google Maps URL"
      }
    ],
    "2": [],
    "3": []
  }
}`;

        const text = await generateContentWithFallback(ai, modelName, prompt);
        const itinerary = parseJSON(text);

        // Append weatherForecast
        itinerary.weatherForecast = weatherForecast || getMockWeatherForecast(route.id);

        res.json({ live: true, itinerary });
    } catch (err) {
        console.error('API Error in generate-itinerary:', err);
        const data = getMockItinerary(route.id, destination);
        data.weatherForecast = getMockWeatherForecast(route.id);
        res.json({ live: false, itinerary: data, error: err.message });
    }
});


// Endpoint 3: Refine/Correct Itinerary
app.post('/api/refine-itinerary', async (req, res) => {
    const { action, customText, currentItinerary } = req.body;
    const ai = getGeminiClient();
    const openRouterActive = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '';

    if (!ai && !openRouterActive) {
        const refined = getMockRefineItinerary(currentItinerary, action, customText);
        if (currentItinerary && currentItinerary.weatherForecast) {
            refined.weatherForecast = currentItinerary.weatherForecast;
        }
        return res.json({ live: false, itinerary: refined });
    }

    try {
        const modelName = req.body.model || "gemini-2.5-flash";

        let instruction = '';
        if (action === 'cheaper') {
            instruction = 'Hãy điều chỉnh lại lịch trình này để tiết kiệm chi phí nhất có thể (chuyển sang ăn bình dân, nhà nghỉ homestay rẻ hơn, cắt bớt dịch vụ xa hoa). Hãy giảm trường totalCost và các trường chi phí lẻ xuống khoảng 30% và thay đổi mô tả phù hợp.';
        } else if (action === 'less-tired') {
            instruction = 'Hãy điều chỉnh lịch trình này để ít mệt hơn đáng kể (giảm thời gian chạy xe liên tục, thay hoạt động leo núi dốc bằng cafe ngắm biển hoặc thư giãn). Hạ chỉ số fatigue xuống 1-2 bậc và viết lại mô tả.';
        } else if (action === 'quieter') {
            instruction = 'Hãy chuyển hướng các địa điểm bãi biển, ăn uống trong lịch trình sang các vùng biển vắng vẻ, biệt lập hơn, bớt náo nhiệt hơn.';
        } else if (action === 'rainy') {
            instruction = 'Hãy điều chỉnh lịch trình này cho phù hợp với thời tiết trời mưa bão (loại bỏ tắm biển, chèo thuyền vịnh ngoài trời; thay bằng bảo tàng, tham quan trong nhà, spa gội đầu, ăn uống đặc sản, cafe ngắm mưa). Hãy tăng cảnh báo verifyAlerts về thời tiết.';
        } else if (action === 'custom') {
            instruction = `Hãy tinh chỉnh lại lịch trình dựa theo yêu cầu riêng biệt sau của người dùng: "${customText}". Cập nhật các hoạt động hoặc chi phí liên quan tương ứng.`;
        }

        const prompt = `Bạn là trợ lý ảo TripEscape AI.
Dưới đây là lịch trình 3 ngày 2 đêm hiện tại của tôi dưới dạng JSON:
${JSON.stringify(currentItinerary)}

YÊU CẦU ĐIỀU CHỈNH: ${instruction}

Hãy chỉnh sửa trực tiếp trên dữ liệu JSON này. Hãy giữ nguyên cấu trúc JSON cũ nhưng cập nhật nội dung các trường (tên hoạt động, mô tả, chi phí, điểm cần kiểm chứng) cho phù hợp với yêu cầu điều chỉnh.
Khi thay đổi địa điểm hoặc thêm hoạt động mới, hãy cập nhật hoặc tạo mới trường "verifyLink" tương ứng của hoạt động đó (đường dẫn Google Maps dạng https://www.google.com/maps/search/?api=1&query=tên+địa+điểm).
Đặc biệt, với những hoạt động nào bị thay đổi nội dung, hãy bổ sung thêm một trường mang tên "highlight": true bên trong đối tượng hoạt động đó để tôi có thể hiển thị màu nổi bật cho người dùng.

Chỉ trả về chuỗi JSON mới hợp lệ. KHÔNG có bất kì chữ giải thích nào ngoài mã JSON.`;

        const text = await generateContentWithFallback(ai, modelName, prompt);
        const refined = parseJSON(text);

        // Preserve weatherForecast
        if (currentItinerary && currentItinerary.weatherForecast) {
            refined.weatherForecast = currentItinerary.weatherForecast;
        }

        res.json({ live: true, itinerary: refined });
    } catch (err) {
        console.error('Gemini API Error in refine-itinerary:', err);
        const refined = getMockRefineItinerary(currentItinerary, action, customText);
        if (currentItinerary && currentItinerary.weatherForecast) {
            refined.weatherForecast = currentItinerary.weatherForecast;
        }
        res.json({ live: false, itinerary: refined, error: err.message });
    }
});

// Mock Generation Helpers
function getMockRoutes(destination, budget, endurance) {
    const dest = destination || 'Cát Bà';
    return mockDatabase.routes.map(r => {
        let name = r.name;
        let reason = r.reason;
        if (destination) {
            name = name.replace(/Cát Bà/g, dest).replace(/Hải Tiến/g, dest).replace(/Cô Tô/g, dest);
            reason = reason.replace(/Cát Bà/g, dest).replace(/Hải Tiến/g, dest).replace(/Cô Tô/g, dest);
        }
        return {
            ...r,
            name,
            reason
        };
    }).filter(r => {
        if (budget && budget.includes('1.5 triệu') && r.id === 'coto') {
            return false;
        }
        if (endurance && endurance.includes('Dễ mệt') && r.id === 'coto') {
            return false;
        }
        return true;
    });
}

function getMockItinerary(routeId, destination) {
    let data = mockDatabase.itineraries[routeId] || mockDatabase.itineraries['catba'];
    if (destination) {
        try {
            let jsonStr = JSON.stringify(data);
            
            // Standard text replacements
            jsonStr = jsonStr.replace(/Cát Bà/g, destination)
                             .replace(/Hải Tiến/g, destination)
                             .replace(/Cô Tô/g, destination);
                             
            // Plus-encoded replacements for verifyLink queries (Cát+Bà, Hải+Tiến, Cô+Tô)
            const destPlus = destination.replace(/ /g, '+');
            
            jsonStr = jsonStr.replace(/C%C3%A1t\+B%C3%A0/g, destPlus)
                             .replace(/H%E1%BA%A3i\+Ti%E1%BA%BFn/g, destPlus)
                             .replace(/C%C3%B4\+T%C3%B4/g, destPlus)
                             .replace(/Cát\+Bà/g, destPlus)
                             .replace(/Hải\+Tiến/g, destPlus)
                             .replace(/Cô\+Tô/g, destPlus);

            data = JSON.parse(jsonStr);
        } catch (e) {
            console.error('Error replacing destination in mock itinerary:', e);
        }
    }
    return data;
}

function getMockRefineItinerary(currentItinerary, action, customText) {
    try {
        const refined = JSON.parse(JSON.stringify(currentItinerary));

        if (action === 'cheaper') {
            refined.totalCost = calculateCheaperPrice(refined.totalCost);
            if (refined.costs) {
                refined.costs.hotel = reduceCostText(refined.costs.hotel, 0.4);
                refined.costs.food = reduceCostText(refined.costs.food, 0.2);
            }
            if (!refined.verifyAlerts) refined.verifyAlerts = [];
            refined.verifyAlerts.push({
                title: '⚠️ Tinh chỉnh Rẻ hơn (Server-Mock)',
                text: 'Lịch trình đã chuyển sang các nhà nghỉ homestay bình dân và quán ăn gia đình giá rẻ.'
            });
            if (refined.days) {
                Object.keys(refined.days).forEach(d => {
                    if (Array.isArray(refined.days[d])) {
                        refined.days[d].forEach(item => {
                            if (item.title && (item.title.includes('Ăn tối') || item.title.includes('Ăn trưa'))) {
                                item.title = item.title.replace('sang trọng', '').replace('nhà hàng bè nổi', 'quán bình dân vỉa hè');
                                item.desc = (item.desc || '') + ' (Chọn quán ăn bình dân khu vực dân sinh để tiết kiệm chi phí).';
                                item.cost = reduceCostText(item.cost, 0.3);
                                item.highlight = true;
                                const queryName = `${item.loc} quán bình dân ăn uống giá rẻ`;
                                item.verifyLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryName)}`;
                            }
                            if (item.title && (item.title.includes('khách sạn') || item.title.includes('homestay') || item.title.includes('phòng'))) {
                                item.title = 'Nhận phòng nhà nghỉ bình dân / Hostel';
                                item.desc = 'Lưu trú tại nhà nghỉ bình dân gần trung tâm để giảm chi phí lưu trú.';
                                item.cost = reduceCostText(item.cost, 0.4);
                                item.highlight = true;
                                const queryName = `${item.loc} nhà nghỉ giá rẻ hostel bình dân`;
                                item.verifyLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryName)}`;
                            }
                        });
                    }
                });
            }
        } 
        else if (action === 'less-tired') {
            refined.fatigue = Math.max(1, (refined.fatigue || 3) - 1);
            refined.fatigueDesc = 'Lịch trình giãn cách hơn, cắt bớt các điểm di chuyển xa hoặc các hoạt động vận động thể lực mạnh.';
            if (refined.days) {
                Object.keys(refined.days).forEach(d => {
                    if (Array.isArray(refined.days[d])) {
                        refined.days[d] = refined.days[d].filter(item => item.title && !item.title.includes('Chinh phục') && !item.title.includes('Trekking') && !item.title.includes('leo đồi'));
                        refined.days[d].forEach(item => {
                            if (item.title && item.title.includes('Xuất phát')) {
                                item.title = 'Xuất phát thong thả';
                                item.desc = 'Bắt đầu hành trình muộn hơn để nghỉ ngơi thêm. Lái xe tốc độ an toàn.';
                                item.highlight = true;
                            }
                            if (item.title && (item.title.includes('Vịnh Lan Hạ') || item.title.includes('Cô Tô Con') || item.title.includes('bãi tắm'))) {
                                item.title = 'Chill tại bãi tắm gần / Quán cafe ngắm biển';
                                item.desc = 'Dành thời gian thư giãn nghỉ ngơi ngay tại bãi biển trung tâm, uống nước dừa, đọc sách.';
                                item.cost = '50.000đ';
                                item.highlight = true;
                                const queryName = `${item.loc} quán cafe ngắm biển ven bờ`;
                                item.verifyLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryName)}`;
                            }
                        });
                    }
                });
            }
        } 
        else if (action === 'quieter') {
            if (!refined.verifyAlerts) refined.verifyAlerts = [];
            refined.verifyAlerts.push({
                title: '⛺ Tinh chỉnh Tránh đông đúc (Server-Mock)',
                text: 'Lịch trình chuyển dịch sang bãi tắm vắng vẻ nằm ngoài trung tâm.'
            });
            if (refined.days) {
                Object.keys(refined.days).forEach(d => {
                    if (Array.isArray(refined.days[d])) {
                        refined.days[d].forEach(item => {
                            if (item.title && item.title.includes('Tắm biển')) {
                                item.title = item.title.replace('Cát Cò 3', 'Bãi tắm Tùng Thu vắng vẻ').replace('Hải Tiến', 'Bãi biển Hải Thanh hoang sơ');
                                item.highlight = true;
                                const queryName = `${item.title} ${item.loc}`;
                                item.verifyLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryName)}`;
                            }
                        });
                    }
                });
            }
        } 
        else if (action === 'rainy') {
            refined.fatigueDesc = 'Lịch trình đã được chuyển hướng sang các hoạt động trong nhà do trời mưa bão.';
            if (!refined.verifyAlerts) refined.verifyAlerts = [];
            refined.verifyAlerts.push({
                title: '🌧️ Phương án trời mưa (Server-Mock)',
                text: 'Thời tiết xấu khiến các hoạt động ngoài trời bị huỷ. Lịch trình tập trung trải nghiệm ẩm thực và nghỉ dưỡng trong nhà.'
            });
            if (refined.days) {
                Object.keys(refined.days).forEach(d => {
                    if (Array.isArray(refined.days[d])) {
                        refined.days[d] = refined.days[d].map(item => {
                            if (item.title && (item.title.includes('Tắm biển') || item.title.includes('Vịnh Lan Hạ') || item.title.includes('Tàu cao tốc') || item.title.includes('Đỉnh Ngự Lâm') || item.title.includes('núi Linh Trường'))) {
                                return {
                                    time: item.time || '09:00',
                                    title: 'Thư giãn tại Spa Đông Y / Cafe sách ven biển',
                                    desc: 'Ngắm mưa rơi lãng mạn bên bờ biển, trải nghiệm gội đầu dưỡng sinh hoặc massage thảo dược.',
                                    cost: '150.000đ',
                                    loc: 'Spa trung tâm thị trấn',
                                    highlight: true,
                                    verifyLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Spa gội đầu massage dưỡng sinh uy tín chất lượng')}`
                                };
                            }
                            return item;
                        });
                    }
                });
            }
        }
        else if (action === 'custom' && customText) {
            if (!refined.verifyAlerts) refined.verifyAlerts = [];
            refined.verifyAlerts.push({
                title: '✨ Tinh chỉnh theo yêu cầu riêng (Server-Mock)',
                text: `Đã cập nhật theo yêu cầu: "${customText}".`
            });
            if (refined.days) {
                if (!refined.days['2']) refined.days['2'] = [];
                refined.days['2'].unshift({
                    time: '14:00',
                    title: `Trải nghiệm: ${customText}`,
                    desc: 'Hoạt động được bổ sung nhanh theo sở thích riêng của bạn.',
                    cost: 'Tự túc',
                    loc: 'Điểm trải nghiệm địa phương',
                    highlight: true,
                    verifyLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customText)}`
                });
            }
        }
        return refined;
    } catch (e) {
        console.error('Error executing mock adjust in getMockRefineItinerary:', e);
        return currentItinerary;
    }
}

// Helper math for mock reductions
function calculateCheaperPrice(priceText) {
    const num = parseInt(priceText.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return priceText;
    const reduced = Math.round((num * 0.7) / 10000) * 10000;
    return reduced.toLocaleString('vi-VN') + 'đ';
}

function reduceCostText(costText, rate = 0.3) {
    if (!costText || costText === 'Miễn phí' || costText === 'Tự túc') return costText;
    const num = parseInt(costText.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return costText;
    const reduced = Math.round((num * (1 - rate)) / 10000) * 10000;
    return reduced.toLocaleString('vi-VN') + 'đ';
}

// ------------------------------------------
// WEATHER, SEARCH & OPENROUTER API INTEGRATIONS
// ------------------------------------------

function resolveWeatherQuery(destination) {
    if (!destination) return "Hanoi";
    const dest = destination.toLowerCase().trim();
    
    // Normalization of Vietnamese characters/accents
    const normalized = dest.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
    
    if (normalized.includes("cat ba")) return "Hai Phong";
    if (normalized.includes("hai tien")) return "Thanh Hoa";
    if (normalized.includes("sam son")) return "Thanh Hoa";
    if (normalized.includes("co to")) return "Hon Gai";
    if (normalized.includes("ha long") || normalized.includes("halong") || normalized.includes("quang ninh")) {
        return "Hon Gai";
    }
    if (normalized.includes("da nang")) return "Danang";
    if (normalized.includes("phu quoc")) return "Rach Gia";
    if (normalized.includes("nha trang")) return "Nha Trang";
    if (normalized.includes("vung tau")) return "Vung Tau";
    if (normalized.includes("sapa") || normalized.includes("sa pa") || normalized.includes("lao cai")) {
        return "Lao Cai";
    }
    if (normalized.includes("da lat")) return "Da Lat";
    if (normalized.includes("ninh binh")) return "Ninh Binh";
    if (normalized.includes("hue")) return "Hue";
    
    return normalized;
}

async function fetchDestinationWeather(destination) {
    const key = process.env.WEATHER_API_KEY;
    if (!key || key.trim() === '') return null;
    
    try {
        const resolvedQuery = resolveWeatherQuery(destination);
        const q = encodeURIComponent(resolvedQuery);
        const url = `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${q}&days=3&lang=vi`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`WeatherAPI returned ${res.status}`);
        const data = await res.json();
        
        if (!data || !data.forecast || !data.forecast.forecastday) {
            return null;
        }
        
        return data.forecast.forecastday.map((d, index) => {
            let icon = d.day.condition.icon || "";
            if (icon.startsWith('//')) {
                icon = `https:${icon}`;
            }
            return {
                day: index + 1,
                date: d.date,
                temp: Math.round(d.day.avgtemp_c),
                text: d.day.condition.text,
                icon: icon,
                willItRain: d.day.daily_will_it_rain
            };
        });
    } catch (err) {
        console.error("Error fetching weather from WeatherAPI:", err.message);
        return null;
    }
}

async function searchDestinationPlaces(destination) {
    const key = process.env.TAVILY_API_KEY;
    if (!key || key.trim() === '') return null;
    
    try {
        const url = "https://api.tavily.com/search";
        const query = `danh sách khách sạn homestay kèm giá phòng, địa điểm du lịch kèm giá vé, quán ăn ngon tại ${destination} mới nhất`;
        
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: key,
                query: query,
                search_depth: "basic",
                include_answer: false,
                max_results: 5
            })
        });
        
        if (!res.ok) throw new Error(`Tavily API returned ${res.status}`);
        const data = await res.json();
        
        if (!data || !data.results) return null;
        
        return data.results.map(r => `- Nguồn: ${r.title}\n  Đường dẫn: ${r.url}\n  Nội dung: ${r.content}`).join('\n\n');
    } catch (err) {
        console.error("Error searching destination places with Tavily:", err.message);
        return null;
    }
}

async function callOpenRouterModel(prompt, clientModel, retryCount = 0) {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key || key.trim() === '') return null;

    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [3000, 8000, 15000]; // 3s, 8s, 15s

    try {
        let model = "meta-llama/llama-3.3-70b-instruct:free"; // Default to free model
        if (clientModel && clientModel.startsWith("openrouter/")) {
            model = clientModel.replace("openrouter/", "");
        } else if (clientModel && clientModel.includes("pro")) {
            model = "google/gemini-2.5-pro";
        } else if (clientModel && clientModel.includes("3.5")) {
            model = "google/gemini-flash-1.5-exp";
        } else if (clientModel && clientModel.includes("flash")) {
            model = "google/gemini-2.5-flash";
        }

        const isFreeModel = model.endsWith(":free");
        const requestBody = {
            model: model,
            messages: [{ role: "user", content: prompt }]
        };
        // response_format json_object is not supported by all free models
        if (!isFreeModel) {
            requestBody.response_format = { type: "json_object" };
        }

        console.log(`[OpenRouter] Calling model: ${model} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "TripEscape AI"
            },
            body: JSON.stringify(requestBody)
        });

        if (res.status === 429) {
            // Rate limit hit — retry with backoff
            if (retryCount < MAX_RETRIES) {
                const delay = RETRY_DELAYS[retryCount];
                console.warn(`[OpenRouter] 429 Rate limit hit. Retrying in ${delay / 1000}s... (${retryCount + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return callOpenRouterModel(prompt, clientModel, retryCount + 1);
            } else {
                console.error("[OpenRouter] 429 Rate limit — max retries exceeded. Falling back to mock.");
                return null;
            }
        }

        if (res.status === 402) {
            console.error("[OpenRouter] 402 Payment Required — account has no credits. Use a :free model or add credits at openrouter.ai/credits");
            return null;
        }

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            throw new Error(`OpenRouter API returned ${res.status}: ${errBody.substring(0, 200)}`);
        }

        const data = await res.json();

        if (!data || !data.choices || data.choices.length === 0) {
            throw new Error("No responses returned from OpenRouter choices");
        }

        const content = data.choices[0].message.content;
        console.log(`[OpenRouter] Success with model: ${model}`);
        return content;

    } catch (err) {
        console.error("Error calling OpenRouter API:", err.message);
        return null;
    }
}

async function generateContentWithFallback(ai, modelName, prompt) {
    const isExplicitOpenRouter = modelName && modelName.startsWith("openrouter/");
    if (ai && !isExplicitOpenRouter) {
        try {
            console.log(`Trying Google Gemini API with model ${modelName}...`);
            const model = ai.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (geminiErr) {
            console.warn(`Gemini API call failed: ${geminiErr.message}. Attempting OpenRouter fallback...`);
        }
    }
    
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey && openRouterKey.trim() !== '') {
        try {
            console.log(`Trying OpenRouter API fallback...`);
            const responseText = await callOpenRouterModel(prompt, modelName);
            if (responseText) return responseText;
        } catch (orErr) {
            console.error(`OpenRouter fallback failed: ${orErr.message}`);
        }
    }
    
    throw new Error("Both Google Gemini and OpenRouter API calls failed or are not configured.");
}

function getMockWeatherForecast(routeId) {
    return [
        { day: 1, date: "Ngày 1", temp: 28, text: "Nắng nhẹ, gió mát", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png", willItRain: 0 },
        { day: 2, date: "Ngày 2", temp: 29, text: "Trời ít mây", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png", willItRain: 0 },
        { day: 3, date: "Ngày 3", temp: 27, text: "Nhiều mây, dịu mát", icon: "//cdn.weatherapi.com/weather/64x64/day/119.png", willItRain: 0 }
    ];
}

// Start Server
app.listen(PORT, () => {
    const hasKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'your_key_here';
    console.log(`=================================================`);
    console.log(`🚀 TripEscape AI Backend Server is running!`);
    console.log(`🔗 Local Address: http://localhost:${PORT}`);
    console.log(`🤖 AI Engine Status: ${hasKey ? 'LIVE API (Gemini)' : 'DEMO MODE (Mocking)'}`);
    console.log(`=================================================`);
});
