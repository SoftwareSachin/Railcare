import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LiveTrainStatus from "@/components/LiveTrainStatus";
import LiveStationInfo from "@/components/LiveStationInfo";
import PNRStatus from "@/components/PNRStatus";

export default function InfoReach() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">InfoReach</h1>
          <p className="text-gray-600 mt-1">Real-time train information and passenger services</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <i className="fas fa-broadcast-tower"></i>
          <span>Live Data from Indian Railways</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Trains Tracked</p>
                <p className="text-2xl font-bold">12,000+</p>
              </div>
              <i className="fas fa-train text-3xl text-green-200"></i>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Stations Covered</p>
                <p className="text-2xl font-bold">8,000+</p>
              </div>
              <i className="fas fa-building text-3xl text-blue-200"></i>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Daily Passengers</p>
                <p className="text-2xl font-bold">23M+</p>
              </div>
              <i className="fas fa-users text-3xl text-purple-200"></i>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Live Updates</p>
                <p className="text-2xl font-bold">Real-time</p>
              </div>
              <i className="fas fa-sync-alt text-3xl text-orange-200"></i>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="train-status" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="train-status" className="flex items-center space-x-2">
                <i className="fas fa-train"></i>
                <span>Train Status</span>
              </TabsTrigger>
              <TabsTrigger value="station-info" className="flex items-center space-x-2">
                <i className="fas fa-building"></i>
                <span>Station Info</span>
              </TabsTrigger>
              <TabsTrigger value="pnr-status" className="flex items-center space-x-2">
                <i className="fas fa-ticket-alt"></i>
                <span>PNR Status</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="train-status" className="space-y-6">
                <LiveTrainStatus />
              </TabsContent>

              <TabsContent value="station-info" className="space-y-6">
                <LiveStationInfo />
              </TabsContent>

              <TabsContent value="pnr-status" className="space-y-6">
                <PNRStatus />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Information Footer */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Service Information</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Real-time train running status and delays</li>
                <li>• Live station arrival/departure boards</li>
                <li>• PNR status with seat/berth confirmation</li>
                <li>• Train route and schedule information</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Data Updates</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Train status updates every 30 seconds</li>
                <li>• Station information refreshed every minute</li>
                <li>• PNR status checked on demand</li>
                <li>• Integrated with Indian Railways API</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}