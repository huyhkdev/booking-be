import axios from 'axios';
import * as XLSX from 'xlsx';
import { HttpStatusCode } from '@/common/constants';
import BadRequestException from '@/common/exception/BadRequestException';
import Booking from '@/databases/entities/Booking';
import config from '@/common/config/config';
import ServerInternalException from '@/common/exception/ServerInternalExeption';

interface ExcelRow {
  Day: string;
  Time: string;
  Activity: string;
  Details: string;
}

class ChatService {
  async generateTravelItinerary(bookingId: string) {
    // Step 1: Get Booking
    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'room',
        populate: {
          path: 'hotel',
          model: 'Hotel',
        },
      })
      .lean();

    if (!booking) {
      throw new BadRequestException({
        errorCode: "NOT_FOUND",
        errorMessage: "Không tìm thấy booking",
      });
    }

    // Step 2: Get the first hotel
    const firstRoom: any = booking.room?.[0];
    const hotel = firstRoom?.hotel;

    if (!hotel) {
      throw new BadRequestException({
        errorCode: "NOT_FOUND",
        errorMessage: "Không tìm thấy hotel",
      });
    }

    // Step 3: Calculate duration
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const durationInDays = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    const location = `${hotel.city}, ${hotel.country}`;

    // Step 4: AI Prompt
    const prompt = `Hãy tạo một lịch trình du lịch chi tiết trong ${durationInDays} ngày tại ${location}. Mỗi ngày bao gồm ít nhất 3 hoạt động (sáng, chiều, tối) gợi ý, có mô tả và thời gian gợi ý. Trả lời bằng JSON với định dạng sau:
    {
      "itinerary": [
        {
          "day": 1,
          "date": "${booking.checkInDate}",
          "activities": [
            {
              "time": "Buổi sáng",
              "title": "Activity title",
              "description": "Detailed description",
              "duration": "2 tiếng",
              "location": "Specific place"
            }
          ]
        }
      ],
      "recommendations": {
        "transportation": "",
        "dining": "",
        "notes": ""
      }
    }`;

    try {
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Bạn là một chuyên gia du lịch. Nhiệm vụ của bạn là lên lịch trình tham quan phù hợp với địa điểm và số ngày du lịch người dùng cung cấp. Trả lời bằng JSON theo định dạng được yêu cầu.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${config.deepSeekApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const itineraryData = JSON.parse(content);

      return itineraryData
    } catch (error) {
      console.error('AI itinerary error:', error);
      throw new ServerInternalException({
        errorCode: "ServerInternalException",
        errorMessage: "Lỗi khi tạo lịch trình du lịch",
      });
    }
  }


}

export default new ChatService();
